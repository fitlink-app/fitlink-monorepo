import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UserPref, UserPrefState} from './types';

// TODO: consider adding a limit for users. Maybe LRU cache
const initialState: UserPrefState = {users: {}};

const usePreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    setUserPreferences: (
      state,
      {payload}: PayloadAction<{email: string; preferences: UserPref}>,
    ) => {
      state.users[payload.email] = {
        ...state.users[payload.email],
        ...payload.preferences,
      };
    },
  },
});

export const {setUserPreferences} = usePreferencesSlice.actions;

export default usePreferencesSlice.reducer;
