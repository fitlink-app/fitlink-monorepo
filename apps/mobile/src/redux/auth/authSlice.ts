import {
  createSlice,
  createSelector,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {AuthResultDto} from '@fitlink/api-sdk/types';
import {RootState} from '../reducer';
import {REHYDRATE} from 'redux-persist';
import api, {getErrors} from '@api';
import {queryClient, QueryKeys} from '@query';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {LOGOUT, SIGN_IN, SIGN_IN_APPLE, SIGN_IN_GOOGLE, SIGN_UP} from './keys';
import {AuthProviderType} from '@fitlink/api/src/modules/auth/auth.constants';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import {flushPersistedQueries} from 'query/QueryPersistor';

type Credentials = {
  email: string;
  password: string;
};

type ConnectProvider = {
  token: string;
  provider: AuthProviderType;
};

export interface AuthState {
  authResult: AuthResultDto | null;
}

export const initialState: AuthState = {authResult: null};

// Thunks
export const signUp = createAsyncThunk(
  SIGN_UP,
  async (credentials: Credentials, {rejectWithValue}) => {
    try {
      const {me, auth} = await api.signUp(credentials);
      queryClient.setQueryData<User>(QueryKeys.Me, me);
      return auth;
    } catch (e) {
      return rejectWithValue(getErrors(e));
    }
  },
);

export const signIn = createAsyncThunk(
  SIGN_IN,
  async (credentials: Credentials, {rejectWithValue}) => {
    try {
      const auth = await api.login(credentials);
      return auth;
    } catch (e) {
      return rejectWithValue(getErrors(e));
    }
  },
);

export const signInWithGoogle = createAsyncThunk(
  SIGN_IN_GOOGLE,
  async (_, {rejectWithValue}) => {
    // TODO: Move this to env/config file
    GoogleSignin.configure({
      webClientId:
        '369193601741-o9ao2iqikmcm0fte2t4on85hrni4dsjc.apps.googleusercontent.com',
      iosClientId:
        '369193601741-bkluos3jpe42b0a5pqfuv7lg5f640n8t.apps.googleusercontent.com',
    });

    await GoogleSignin.signOut();

    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    //Authenticate token on backend against Google, get back JWT
    if (idToken) {
      try {
        const auth = await connect({
          token: idToken,
          provider: AuthProviderType.Google,
        });
        return auth;
      } catch (e) {
        return rejectWithValue(getErrors(e).message);
      }
    }
  },
);

export const signInWithApple = createAsyncThunk(
  SIGN_IN_APPLE,
  async (_, {rejectWithValue}) => {
    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken)
      throw Error('Apple Sign-In failed - no identify token returned');

    const {authorizationCode} = appleAuthRequestResponse;

    if (authorizationCode) {
      try {
        const auth = await connect({
          token: authorizationCode,
          provider: AuthProviderType.Apple,
        });

        return auth;
      } catch (e) {
        return rejectWithValue(getErrors(e).message);
      }
    }
  },
);

export const logout = createAsyncThunk(
  LOGOUT,
  async (_, {dispatch, rejectWithValue}) => {
    try {
      dispatch(clearAuthResult());
      flushPersistedQueries();
      queryClient.removeQueries();
      await api.logout();
    } catch (e) {
      return getErrors(e);
    }
  },
);

// Functions
async function connect({token, provider}: ConnectProvider) {
  const {me, auth} = await api.connect({
    token,
    provider,
  });

  queryClient.setQueryData<User>(QueryKeys.Me, me);
  return auth;
}

// Kimbo
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthResult: (state, {payload}: PayloadAction<AuthResultDto>) => {
      state.authResult = payload;
    },
    clearAuthResult: state => {
      state.authResult = null;
    },
  },
  extraReducers: builder => {
    builder
      // Signup reducers
      .addCase(signUp.fulfilled, (state, {payload}) => {
        if (payload) state.authResult = payload;
      })

      // Signin reducers
      .addCase(signIn.fulfilled, (state, {payload}) => {
        if (payload) state.authResult = payload;
      })

      // Google Signin reducers
      .addCase(signInWithGoogle.fulfilled, (state, {payload}) => {
        if (payload) state.authResult = payload;
      })

      // Rehydrate reducer
      .addCase(REHYDRATE, (state, {payload}: any) => {
        if (!!payload?.auth?.authResult) api.setTokens(payload.auth.authResult);
      });
  },
});

// Selectors & Exports
export const selectAuthResult = ({auth: {authResult}}: RootState) => authResult;

export const memoSelectIsAuthenticated = createSelector(
  [selectAuthResult],
  authResult => !!authResult,
);

export const {setAuthResult, clearAuthResult} = authSlice.actions;

export default authSlice.reducer;