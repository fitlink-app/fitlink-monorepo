import {RootState} from '../reducer';
import {createSelector} from '@reduxjs/toolkit';

export const selectAuthResult = ({auth: {authResult}}: RootState) => authResult;

export const memoSelectIsAuthenticated = createSelector(
  [selectAuthResult],
  authResult => !!authResult,
);
