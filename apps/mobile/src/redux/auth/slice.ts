import {isAnyOf, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {REHYDRATE} from 'redux-persist';

import api from '@api';
import {AuthResultDto} from '@fitlink/api-sdk/types';

import {AuthState} from './types';
import {signIn, signInWithApple, signInWithGoogle, signUp} from './actions';

export const initialState: AuthState = {
  authResult: null,
  error: null,
  clientSideAccess: {
    accessGrantedAt: undefined,
    isAccessGranted: false,
    pinErrorsCount: 0,
    pinErrorCountExceededAt: undefined,
  },
};

const isAnyOfSignInFulfilled = isAnyOf(
  signUp.fulfilled,
  signIn.fulfilled,
  signInWithApple.fulfilled,
  signInWithGoogle.fulfilled,
);

const isAnyOfSignInRejected = isAnyOf(
  signUp.rejected,
  signIn.rejected,
  signInWithApple.rejected,
  signInWithGoogle.rejected,
);

const isAnyOfSignInPending = isAnyOf(
  signUp.pending,
  signIn.pending,
  signInWithApple.pending,
  signInWithGoogle.pending,
);

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthResult: (state, {payload}: PayloadAction<AuthResultDto>) => {
      state.authResult = payload;
    },
    resetAuthState: () => initialState,
    grantClientSideAccess: state => {
      state.clientSideAccess.accessGrantedAt = Date.now();
      state.clientSideAccess.isAccessGranted = true;
    },
    revokeClientSideAccess: state => {
      state.clientSideAccess.isAccessGranted = false;
    },
    incrementPinErrorCount: state => {
      state.clientSideAccess.pinErrorsCount =
        state.clientSideAccess.pinErrorsCount + 1;
    },
    resetPinErrorCount: state => {
      state.clientSideAccess.pinErrorsCount = 0;
    },
    resetLastPinErrorCountExceeded: state => {
      state.clientSideAccess.pinErrorCountExceededAt = Date.now();
    },
    clearLastPinErrorCountExceeded: state => {
      state.clientSideAccess.pinErrorCountExceededAt = undefined;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(REHYDRATE, (state, {payload}: any) => {
        if (payload?.auth?.authResult) {
          api.setTokens(payload.auth.authResult);
        }
      })
      .addMatcher(isAnyOfSignInFulfilled, (state, {payload}) => {
        // TODO: it's not safe
        // move all tokens logic to API SDK, and just get authorized: boolean
        state.authResult = payload;
        api.setTokens(payload);
      })
      .addMatcher(isAnyOfSignInRejected, (state, {error}) => {
        state.error = error;
      })
      .addMatcher(isAnyOfSignInPending, state => {
        state.error = null;
      });
  },
});

export const {
  setAuthResult,
  resetAuthState,
  grantClientSideAccess,
  revokeClientSideAccess,
  incrementPinErrorCount,
  resetPinErrorCount,
  resetLastPinErrorCountExceeded,
  clearLastPinErrorCountExceeded,
} = slice.actions;

export default slice.reducer;
