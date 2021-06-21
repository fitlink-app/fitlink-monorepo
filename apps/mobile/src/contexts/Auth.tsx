import React, {createContext} from 'react';
import api, {getErrors, RequestError} from '@api';
import {usePersistedState} from '@hooks';
import {AuthResultDto} from '../../../api-sdk/types';
import {useEffect} from 'react';
import {User} from '../../../api/src/modules/users/entities/user.entity';
import {queryClient, QueryKeys} from '@query';
import {AsyncStorageKeys} from '@utils';

type Credentials = {
  email: string;
  password: string;
};

interface AuthContextType {
  isLoggedIn: boolean;
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

  const isLoggedIn = !!authResult;

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

  const contextValue = {isLoggedIn, signIn, signUp, logout};

  return (
    <AuthContext.Provider value={contextValue}>
      {isRestored ? children : null}
    </AuthContext.Provider>
  );
};
