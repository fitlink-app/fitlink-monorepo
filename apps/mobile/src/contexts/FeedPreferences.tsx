import React, {createContext} from 'react';
import {usePersistedState} from '@hooks';
import {AsyncStorageKeys} from '@utils';

type FeedPreferencesStateType = {
  friendsShown?: boolean;
  goalsShown?: boolean;
  updatesShown?: boolean;
};

interface FeedPreferencesContextType extends FeedPreferencesStateType {
  setFriendsShown: (value: boolean) => void;
  setGoalsShown: (value: boolean) => void;
  setUpdatesShown: (value: boolean) => void;
}

export const FeedPreferencesContext = createContext<FeedPreferencesContextType>(
  {} as FeedPreferencesContextType,
);

const initialState: FeedPreferencesStateType = {
  friendsShown: true,
  goalsShown: true,
  updatesShown: true,
};

export const FeedPreferencesProvider: React.FC = ({children}) => {
  const [feedPreferences, setFeedPreferences, isRestored] =
    usePersistedState<FeedPreferencesStateType>(
      initialState,
      AsyncStorageKeys.AUTH_RESULT,
    );

  const setFriendsShown = (value: boolean) => {
    setFeedPreferences({...feedPreferences!, friendsShown: value});
  };

  const setGoalsShown = (value: boolean) => {
    setFeedPreferences({...feedPreferences!, goalsShown: value});
  };

  const setUpdatesShown = (value: boolean) => {
    setFeedPreferences({...feedPreferences!, updatesShown: value});
  };

  const contextValue = {
    friendsShown: feedPreferences?.friendsShown,
    goalsShown: feedPreferences?.goalsShown,
    updatesShown: feedPreferences?.updatesShown,
    setFriendsShown,
    setGoalsShown,
    setUpdatesShown,
  };

  return (
    <FeedPreferencesContext.Provider value={contextValue}>
      {isRestored ? children : null}
    </FeedPreferencesContext.Provider>
  );
};
