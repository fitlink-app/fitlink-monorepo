import {RootState} from '../reducer';

export const selectAuthState = (state: RootState) => state.auth;

export const selectAuthResult = ({auth: {authResult}}: RootState) => authResult;

export const selectIsAuthenticated = (state: RootState) =>
  !!selectAuthResult(state);

export const selectIsClientSideAccessGranted = (state: RootState) =>
  selectAuthState(state).clientSideAccess.isAccessGranted;

export const selectClientSideAccessGrantedAt = (state: RootState) =>
  selectAuthState(state).clientSideAccess.accessGrantedAt;

export const selectPinErrorsCount = (state: RootState) =>
  selectAuthState(state).clientSideAccess.pinErrorsCount;

export const selectPinErrorCountExceededAt = (state: RootState) =>
  selectAuthState(state).clientSideAccess.pinErrorCountExceededAt;
