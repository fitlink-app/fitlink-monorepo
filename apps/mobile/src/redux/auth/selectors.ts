import {RootState} from '../reducer';
import {createSelector} from '@reduxjs/toolkit';

export const selectAuthState = (state: RootState) => state.auth;

export const selectAuthResult = ({auth: {authResult}}: RootState) => authResult;

export const memoSelectIsAuthenticated = createSelector(
  [selectAuthResult],
  authResult => !!authResult,
);

export const selectIsClientSideAccessGranted = (state: RootState) =>
  selectAuthState(state).clientSideAccess.isAccessGranted;

export const selectClientSideAccessGrantedAt = (state: RootState) =>
  selectAuthState(state).clientSideAccess.accessGrantedAt;

export const selectPinErrorsCount = (state: RootState) =>
  selectAuthState(state).clientSideAccess.pinErrorsCount;

export const selectPinErrorCountExceededAt = (state: RootState) =>
  selectAuthState(state).clientSideAccess.pinErrorCountExceededAt;
