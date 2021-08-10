import {AnyAction, combineReducers} from '@reduxjs/toolkit';
import authSlice, {clearAuthResult} from './auth/authSlice';

const appReducer = combineReducers({
  auth: authSlice,
});

const rootReducer = (
  state: ReturnType<typeof appReducer>,
  action: AnyAction,
) => {
  if (action.type === clearAuthResult.type) {
    // Flush redux in case of an auth state wipe (e.g. logout side effect)
    return appReducer(undefined, {type: undefined});
  }

  return appReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
