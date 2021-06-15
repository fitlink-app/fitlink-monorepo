import React, {createContext, useState} from 'react';
import api, {getErrors, RequestError} from '@api';
import {AsyncStorageKeys} from '@constants';
import {usePersistedState} from '@hooks';
import {AuthResultDto} from '../../../api-sdk/types';
import {useEffect} from 'react';
import {queryClient, QueryKeys} from '@query';
import {User} from '../../../api/src/modules/users/entities/user.entity';

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

type AuthState = {
  auth: AuthResultDto | null;
  user: User | null;
};

const initialState = {
  auth: null,
  user: null,
};

export const AuthProvider: React.FC = ({children}) => {
  const [state, setState, isRestored] = usePersistedState<AuthState>(
    initialState,
    AsyncStorageKeys.USER,
  );

  const [isUserRestored, setUserRestored] = useState(false);

  const isLoggedIn = !!state?.auth;

  const isContextInitialized = isRestored && isUserRestored;

  useEffect(() => {
    if (!state || !isRestored) return;

    const {auth, user} = state;

    // Restore persisted AuthResult and attach to the API SDK instance
    if (auth) api.setTokens(auth);

    // Restore persisted User and store it in the corresponding query
    if (user) queryClient.setQueryData(QueryKeys.Me, () => user);

    setUserRestored(true);
  }, [state]);

  async function signIn(credentials: Credentials) {
    try {
      const auth = await api.login(credentials);
      const user = await api.get<User>('/me');
      setState({auth, user});
    } catch (e) {
      return getErrors(e);
    }
  }

  async function signUp(credentials: Credentials) {
    try {
      const {me, auth} = await api.signUp(credentials);
      setState({auth, user: me});
    } catch (e) {
      return getErrors(e);
    }
  }

  async function logout() {
    try {
      setState(initialState);
      await api.logout();
    } catch (e) {
      return getErrors(e);
    }
  }

  const contextValue = {isLoggedIn, signIn, signUp, logout};

  return (
    <AuthContext.Provider value={contextValue}>
      {isContextInitialized ? children : null}
    </AuthContext.Provider>
  );
};
