import {isAnyOf, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {REHYDRATE} from 'redux-persist';

import api from '@api';
import {AuthResultDto} from '@fitlink/api-sdk/types';

import {AuthState} from './types';
import {signIn, signInWithApple, signInWithGoogle, signUp} from './actions';

export const initialState: AuthState = {authResult: null, error: null};

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
    clearAuthResult: state => {
      state.authResult = null;
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

export const {setAuthResult, clearAuthResult} = slice.actions;

export default slice.reducer;
