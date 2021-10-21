import {createSlice, createSelector, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../reducer';

export type FeedPreferences = {
  showFriends: boolean;
  showGoals: boolean;
  showUpdates: boolean;
};

export const initialState: FeedPreferences = {
  showFriends: true,
  showGoals: true,
  showUpdates: true,
};

const feedPreferencesSlice = createSlice({
  name: 'feedPreferences',
  initialState,
  reducers: {
    setFeedPreferences: (state, {payload}: PayloadAction<FeedPreferences>) => {
      return payload;
    },
  },
});

export const selectFeedPreferences = (state: RootState) =>
  state.feedPreferences;

export const memoSelectFeedPreferences = createSelector(
  [selectFeedPreferences],
  prefs => prefs,
);

export const {setFeedPreferences} = feedPreferencesSlice.actions;

export default feedPreferencesSlice.reducer;
