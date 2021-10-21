import {AnyAction, combineReducers} from '@reduxjs/toolkit';
import authSlice, {clearAuthResult} from './auth/authSlice';
import discoverSlice from './discover/discoverSlice';
import feedPreferencesSlice from './feedPreferences/feedPreferencesSlice';
import settingsSlice from './settings/settingsSlice';
import teamInvitationSlice from './teamInvitation/teamInvitationSlice';

const appReducer = combineReducers({
  auth: authSlice,
  feedPreferences: feedPreferencesSlice,
  discover: discoverSlice,
  settings: settingsSlice,
  teamInvitation: teamInvitationSlice,
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
