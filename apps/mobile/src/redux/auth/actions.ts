import {createAsyncThunk} from '@reduxjs/toolkit';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import {KeychainService} from '@model';
import {queryClient, QueryKeys} from '@query';
import {getErrorMessage} from '@fitlink/api-sdk';
import {ResponseError} from '@fitlink/api-sdk/types';
import api, {FCMTokenService, getErrors} from '@api';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {AuthProviderType} from '@fitlink/api/src/modules/auth/auth.constants';
import {AppleRequestResponse} from '@invertase/react-native-apple-authentication';

import {
  DELETE_ACCOUNT,
  LOGOUT,
  SIGN_IN,
  SIGN_IN_APPLE,
  SIGN_IN_GOOGLE,
  SIGN_UP,
} from './keys';
import {flushPersistedQueries} from '../../query/QueryPersistor';
import {resetAuthState} from './slice';
import {Credentials} from './types';
import {checkAuthResult, connect} from './utils';

export const signUp = createAsyncThunk(
  SIGN_UP,
  async (credentials: Credentials, {rejectWithValue}) => {
    try {
      const {me, auth} = await api.signUp(credentials);
      queryClient.setQueryData<User>(QueryKeys.Me, me);
      if (!checkAuthResult(auth)) {
        return rejectWithValue(new Error('Incorrect authorization response'));
      }
      return auth;
    } catch (e) {
      return rejectWithValue(new Error(getErrorMessage(e as ResponseError)));
    }
  },
);

export const signIn = createAsyncThunk(
  SIGN_IN,
  async (credentials: Credentials, {rejectWithValue}) => {
    try {
      const auth = await api.login(credentials);
      if (!checkAuthResult(auth)) {
        return rejectWithValue(new Error('Incorrect authorization response'));
      }
      return auth;
    } catch (e) {
      return rejectWithValue(new Error(getErrorMessage(e as ResponseError)));
    }
  },
);

export const signInWithGoogle = createAsyncThunk(
  SIGN_IN_GOOGLE,
  async (idToken: string, {rejectWithValue}) => {
    try {
      await GoogleSignin.signOut();
      const auth = await connect({
        token: idToken,
        provider: AuthProviderType.Google,
      });
      if (!checkAuthResult(auth)) {
        return rejectWithValue(new Error('Incorrect authorization response'));
      }
      return auth;
    } catch (e) {
      return rejectWithValue(new Error(getErrorMessage(e as ResponseError)));
    }
  },
);

export const signInWithApple = createAsyncThunk(
  SIGN_IN_APPLE,
  async (authRequestResponse: AppleRequestResponse, {rejectWithValue}) => {
    const {identityToken, authorizationCode} = authRequestResponse;
    if (!identityToken) {
      return rejectWithValue(
        new Error('Incorrect Apple auth response: no identityToken'),
      );
    }
    if (!authorizationCode) {
      return rejectWithValue(
        new Error('Incorrect Apple auth response: no authorizationCode'),
      );
    }
    const auth = await connect({
      token: authorizationCode,
      provider: AuthProviderType.Apple,
    });
    if (!checkAuthResult(auth)) {
      return rejectWithValue(new Error('Incorrect authorization response'));
    }
    return auth;
  },
);

export const logout = createAsyncThunk(LOGOUT, async (_, {dispatch}) => {
  dispatch(resetAuthState());
  flushPersistedQueries();

  await Promise.all([
    queryClient.removeQueries(),
    FCMTokenService.deleteCurrentToken(),
    api.logout(),
  ]);
});

export const deleteAccount = createAsyncThunk(
  DELETE_ACCOUNT,
  async (_, {dispatch}) => {
    try {
      dispatch(resetAuthState());
      flushPersistedQueries();
      await api.delete('/me');
      queryClient.removeQueries();
      await api.logout();
      const Keychain = await KeychainService.getInstance();
      await Keychain.resetKeychain();
    } catch (e: any) {
      return getErrors(e);
    }
  },
);
