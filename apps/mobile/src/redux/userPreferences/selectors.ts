import {RootState} from '../reducer';
import {UserPref} from './types';

const initialUserPreferences: UserPref = {
  showLeaguesTipBanner: true,
};

const selectUserPreferences = (state: RootState) => state.userPreferences;

export const selectUserPreferencesByEmail = (
  state: RootState,
  email: string | undefined | null,
) => {
  if (email == null) {
    return null;
  }
  return selectUserPreferences(state).users[email] ?? initialUserPreferences;
};
