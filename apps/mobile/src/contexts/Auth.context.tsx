import React, {createContext} from 'react';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import api, {getErrors, RequestError} from '@api';
import {AsyncStorageKeys} from '@constants';
import {usePersistedState} from '@hooks';
import {useEffect} from 'react';

type Credentials = {
  email: string;
  password: string;
};

interface AuthContextType {
  user?: User;
  isLoggedIn: boolean;
  signIn: (credentials: Credentials) => Promise<RequestError | undefined>;
  signUp: (credentials: Credentials) => Promise<RequestError | undefined>;
  logout: () => Promise<RequestError | undefined>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider: React.FC = ({children}) => {
  const [user, setUser] = usePersistedState<User | undefined>(
    undefined,
    AsyncStorageKeys.USER,
  );

  const isLoggedIn = !!user;

  async function signIn(credentials: Credentials) {
    try {
      await api.login(credentials);
      const responseUser = await api.get<User>('/me');
      setUser(responseUser);
    } catch (e) {
      return getErrors(e);
    }
  }

  async function signUp(credentials: Credentials) {
    try {
      const {me} = await api.signUp(credentials);
      setUser(me);
    } catch (e) {
      return getErrors(e);
    }
  }

  async function logout() {
    try {
      const result = await api.logout();
      if (result.success) setUser(undefined);
    } catch (e) {
      return getErrors(e);
    }
  }

  const contextValue = {user, isLoggedIn, signIn, signUp, logout};

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
