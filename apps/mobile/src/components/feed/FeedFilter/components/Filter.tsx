import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  FeedPreferences,
  memoSelectFeedPreferences,
  setFeedPreferences,
} from 'redux/feedPreferences/feedPreferencesSlice';
import styled from 'styled-components/native';
import {Dimensions} from 'react-native';
import {CheckButton} from './CheckButton';
import {Button} from '../../../common';

const {width: screenWidth} = Dimensions.get('screen');

const ButtonContainer = styled.View({
  marginVertical: 20,
  width: screenWidth - 100,
});

interface FilterProps {
  onSavePreferences: () => void;
}

export const Filter = ({onSavePreferences}: FilterProps) => {
  const dispatch = useDispatch();
  const persistedPreferences = useSelector(memoSelectFeedPreferences);

  const [localPreferences, setLocalPreferences] = useState<FeedPreferences>({
    showFriends: persistedPreferences.showFriends,
    showGoals: persistedPreferences.showGoals,
    showUpdates: persistedPreferences.showUpdates,
  });

  const setFilterValue = (filter: keyof FeedPreferences, value: boolean) => {
    const newPreferences = {...localPreferences};
    newPreferences[filter] = value;
    setLocalPreferences(newPreferences);
  };

  const handleSave = () => {
    dispatch(setFeedPreferences(localPreferences));
    onSavePreferences();
  };

  return (
    <ButtonContainer>
      <CheckButton disabled label={'My Activities'} checked={true} />
      <CheckButton
        label={'Friends Activities'}
        checked={localPreferences.showFriends}
        style={{
          borderBottomWidth: 1,
          borderTopWidth: 1,
          borderColor: 'rgba(255,255,255,.05)',
        }}
        onPress={() =>
          setFilterValue('showFriends', !localPreferences.showFriends)
        }
      />
      <CheckButton
        label={'My Goals'}
        checked={localPreferences.showGoals}
        style={{
          borderBottomWidth: 1,
          borderTopWidth: 1,
          borderColor: 'rgba(255,255,255,.05)',
        }}
        onPress={() => setFilterValue('showGoals', !localPreferences.showGoals)}
      />

      <CheckButton
        label={'My Updates'}
        checked={localPreferences.showUpdates}
        onPress={() =>
          setFilterValue('showUpdates', !localPreferences.showUpdates)
        }
      />

      <Button
        onPress={handleSave}
        text={'Save Preferences'}
        style={{paddingTop: 20, width: '100%'}}
      />
    </ButtonContainer>
  );
};
