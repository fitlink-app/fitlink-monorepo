import React, {createContext} from 'react';
import api, {getErrors, RequestError} from '@api';
import {usePersistedState} from '@hooks';
import {AuthResultDto} from '../../../api-sdk/types';
import {useEffect} from 'react';
import {User} from '../../../api/src/modules/users/entities/user.entity';
import {queryClient, QueryKeys} from '@query';
import {AsyncStorageKeys} from '@utils';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';

type Credentials = {
  email: string;
  password: string;
};

interface AuthContextType {
  isLoggedIn: boolean;
  isAppleSignInSupported: boolean;
  signInWithGoogle: () => void;
  signInWithApple: () => void;
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

  useEffect(() => {
    if (!authResult || !isRestored) return;

    // Restore persisted AuthResult and attach to the API SDK instance
    if (authResult) api.setTokens(authResult);
  }, [authResult]);

  async function signIn(credentials: Credentials) {
    try {
      const auth = await api.login(credentials);
      setAuthResult(auth);
    } catch (e) {
      return getErrors(e);
    }
  }

  const isLoggedIn = !!authResult;

  const isAppleSignInSupported = appleAuth.isSupported;

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

    console.log('Google Token: ' + idToken);

    // TODO: Authenticate token on backend against Google, get back JWT
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

    const {identityToken, nonce} = appleAuthRequestResponse;

    console.log('Apple token:');
    console.log(identityToken);
    console.log(nonce);
    // TODO: Authenticate token on backend against Apple, get back JWT
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
      queryClient.invalidateQueries(QueryKeys.Me);
      await api.logout();
    } catch (e) {
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
