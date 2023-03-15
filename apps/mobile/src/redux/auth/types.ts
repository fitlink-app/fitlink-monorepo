import {SerializedError} from '@reduxjs/toolkit';

import {AuthProviderType} from '@fitlink/api/src/modules/auth/auth.constants';
import {AuthResultDto} from '@fitlink/api/src/modules/auth/dto/auth-result';

export type Credentials = {
  email: string;
  password: string;
};

export type ConnectProvider = {
  token: string;
  provider: AuthProviderType;
};

export interface AuthState {
  authResult: AuthResultDto | null;
  error: SerializedError | null;

  clientSideAccess: {
    isAccessGranted: boolean;
    lastAccessGranted: number | undefined;

    pinErrorsCount: number;
    lastPinErrorCountExceeded: number | undefined;
  };
}
