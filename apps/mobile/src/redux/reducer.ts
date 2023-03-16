import Intercom from '@intercom/intercom-react-native';
import {AnyAction, combineReducers} from '@reduxjs/toolkit';
import authSlice, {resetAuthState} from './auth/slice';
import discoverSlice from './discover/discoverSlice';
import feedPreferencesSlice from './feedPreferences/feedPreferencesSlice';
import settingsSlice from './settings/settingsSlice';
import teamInvitationSlice from './teamInvitation/teamInvitationSlice';
import userPreferences from './userPreferences';

const appReducer = combineReducers({
  auth: authSlice,
  feedPreferences: feedPreferencesSlice,
  discover: discoverSlice,
  settings: settingsSlice,
  teamInvitation: teamInvitationSlice,
  userPreferences: userPreferences,
});

const rootReducer = (
  state: ReturnType<typeof appReducer>,
  action: AnyAction,
) => {
  if (action.type === resetAuthState.type) {
    Intercom.logout().catch(e =>
      console.error('Failed to logout from Intercom: ', e),
    );

    // Flush redux in case of an auth state wipe (e.g. logout side effect)
    return appReducer(undefined, {type: undefined});
  }

  return appReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
