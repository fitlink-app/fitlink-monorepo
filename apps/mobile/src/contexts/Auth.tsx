import React, {createContext} from 'react';
import api, {getErrors, RequestError} from '@api';
import {usePersistedState} from '@hooks';
import {AuthResultDto, AuthProviderType} from '@fitlink/api-sdk/types';
import {useEffect} from 'react';
import {User} from '../../../api/src/modules/users/entities/user.entity';
import {queryClient, QueryKeys} from '@query';
import {AsyncStorageKeys} from '@utils';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import {flushPersistedQueries} from 'query/QueryPersistor';
import {useDispatch, useSelector} from 'react-redux';
import {selectAuthResult, setAuthResult as hurka} from 'redux/auth/authSlice';

type Credentials = {
  email: string;
  password: string;
};

type ConnectProvider = {
  token: string;
  provider: AuthProviderType;
};

interface AuthContextType {
  isLoggedIn: boolean;
  isAppleSignInSupported: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signIn: (credentials: Credentials) => Promise<RequestError | undefined>;
  signUp: (credentials: Credentials) => Promise<RequestError | undefined>;
  logout: () => Promise<RequestError | undefined>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

type AuthState = AuthResultDto | null;

const initialState = null;

export const AuthProvider: React.FC = ({children}) => {
  const [authResult, setAuthResult, isRestored] = usePersistedState<AuthState>(
    initialState,
    AsyncStorageKeys.AUTH_RESULT,
  );

  const dispatch = useDispatch();

  console.log('hi');
  const authResultRedux = useSelector(selectAuthResult);
  console.log(authResultRedux);

  useEffect(() => {
    if (!authResult || !isRestored) return;

    // Restore persisted AuthResult and attach to the API SDK instance
    if (authResult) api.setTokens(authResult);
  }, [authResult]);

  const isLoggedIn = !!authResult;

  const isAppleSignInSupported = appleAuth.isSupported;

  async function signIn(credentials: Credentials) {
    try {
      const auth = await api.login(credentials);
      setAuthResult(auth);
      dispatch(hurka(auth));
    } catch (e) {
      return getErrors(e);
    }
  }

  async function connect({token, provider}: ConnectProvider) {
    const {me, auth} = await api.connect({
      token,
      provider,
    });

    queryClient.setQueryData<User>(QueryKeys.Me, me);
    setAuthResult(auth);
  }

  async function signInWithGoogle() {
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
        await connect({token: idToken, provider: AuthProviderType.Google});
      } catch (e) {
        throw Error(getErrors(e).message);
      }
    }
  }

  async function signInWithApple() {
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
        await connect({
          token: authorizationCode,
          provider: AuthProviderType.Apple,
        });
      } catch (e) {
        console.log('here');
        console.log(e);
        console.log(getErrors(e));
        throw Error(getErrors(e).message);
      }
    }
  }

  async function signUp(credentials: Credentials) {
    try {
      const {me, auth} = await api.signUp(credentials);
      queryClient.setQueryData<User>(QueryKeys.Me, me);
      setAuthResult(auth);
    } catch (e) {
      return getErrors(e);
    }
  }

  async function logout() {
    try {
      setAuthResult(initialState);
      flushPersistedQueries();
      queryClient.removeQueries();
      await api.logout();
    } catch (e) {
      console.log('logout error');
      return getErrors(e);
    }
  }

  const contextValue = {
    isLoggedIn,
    isAppleSignInSupported,
    signInWithGoogle,
    signInWithApple,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {isRestored ? children : null}
    </AuthContext.Provider>
  );
};
