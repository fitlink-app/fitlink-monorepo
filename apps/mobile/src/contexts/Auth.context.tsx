import React, {createContext, useState} from 'react';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import api from '@api';
import {getErrorMessage} from '@fitlink/api-sdk';

type Credentials = {
  email: string;
  password: string;
};

interface AuthContextType {
  user?: User;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider: React.FC = ({children}) => {
  const [user, setUser] = useState<User>();

  function isLoggedIn() {
    return !!user;
  }

  async function signIn(credentials: Credentials) {
    try {
      const result = await api.login(credentials);
    } catch (e) {
      const errorMsg = getErrorMessage(e);
    }
  }

  async function signUp() {}

  async function logout() {}

  const contextValue = {user, signIn, signUp, logout};

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
