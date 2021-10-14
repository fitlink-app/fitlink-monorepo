import {Card, KeyboardAvoidingView, Label} from '@components';
import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectSettings,
  setGoals,
  UserGoalPreferences,
} from 'redux/settings/settingsSlice';
import {AppDispatch} from 'redux/store';
import styled from 'styled-components/native';
import {GoalTextField} from './components';

const Wrapper = styled.View({height: '100%', justifyContent: 'center'});

const GoalChooserContainer = styled(ScrollView).attrs(() => ({
  contentContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 20,
  },
  keyboardShouldPersistTaps: 'never',
  scrollEnabled: false,
}))({});

const FieldsWrapper = styled(Card)({
  padding: 20,
  width: '100%',
});

type UserGoalPreferencesString = {
  [K in keyof UserGoalPreferences]: string;
};

export const Goals = () => {
  const dispatch = useDispatch() as AppDispatch;

  const settings = useSelector(selectSettings);

  const initializeGoalsFromNumericSource = (source: UserGoalPreferences) => {
    return {
      goal_mindfulness_minutes: source.goal_mindfulness_minutes.toString(),
      goal_steps: source.goal_steps.toString(),
      goal_floors_climbed: source.goal_floors_climbed.toString(),
      goal_water_litres: source.goal_water_litres.toString(),
      goal_sleep_hours: source.goal_sleep_hours.toString(),
    };
  };

  const [localGoals, setLocalGoals] = useState<UserGoalPreferencesString>(
    initializeGoalsFromNumericSource(settings.goals),
  );

  /**
   * Sets value for a goal input field in the local state
   *
   * @param value Text value of the field
   * @param field Field's name e.g.: "goal_steps"
   */
  const handleOnGoalChanged = (value: string, field: string) => {
    let formattedValue = value;
    setLocalGoals(prevGoals => ({...prevGoals, [field]: formattedValue}));
  };

  /**
   * Invoked when editing a goal field's value is ended
   *
   * This function will parse and transfer the local goal state
   * to the settings hook state
   */
  const handleOnGoalSubmitted = () => {
    let parsedGoals = {...settings.goals};

    for (const property in localGoals) {
      let parsedValue = parseFloat(
        localGoals[property as keyof UserGoalPreferencesString],
      );
      if (isNaN(parsedValue)) parsedValue = 0;
      parsedGoals[property as keyof UserGoalPreferences] = parsedValue;
    }

    setLocalGoals(initializeGoalsFromNumericSource(parsedGoals));
    dispatch(setGoals(parsedGoals));
  };

  return (
    <Wrapper>
      <KeyboardAvoidingView>
        <GoalChooserContainer>
          <View style={{marginBottom: 20, alignItems: 'center'}}>
            <Label type={'title'} style={{textAlign: 'center'}}>
              Hi{' '}
              <Label type={'title'} bold>
                {settings.name}
              </Label>
              , let's set{'\n'}your personal daily goals
            </Label>
          </View>

          <FieldsWrapper>
            <GoalTextField
              label={'Total Steps'}
              value={localGoals.goal_steps.toString()}
              icon={'steps'}
              onChangeText={(value: string) =>
                handleOnGoalChanged(value, 'goal_steps')
              }
              onEndEditing={handleOnGoalSubmitted}
            />

            <GoalTextField
              style={{marginTop: 25}}
              label={'Floors Climbed'}
              value={localGoals.goal_floors_climbed.toString()}
              icon={'stairs'}
              onChangeText={(value: string) =>
                handleOnGoalChanged(value, 'goal_floors_climbed')
              }
              onEndEditing={handleOnGoalSubmitted}
            />

            <GoalTextField
              style={{marginTop: 25}}
              label={'Litres of Water'}
              value={localGoals.goal_water_litres.toString()}
              icon={'water'}
              onChangeText={(value: string) =>
                handleOnGoalChanged(value, 'goal_water_litres')
              }
              onEndEditing={handleOnGoalSubmitted}
            />

            <GoalTextField
              style={{marginTop: 25}}
              label={'Sleep'}
              value={localGoals.goal_sleep_hours.toString()}
              icon={'sleep'}
              onChangeText={(value: string) =>
                handleOnGoalChanged(value, 'goal_sleep_hours')
              }
              onEndEditing={handleOnGoalSubmitted}
            />

            <GoalTextField
              style={{marginTop: 25}}
              label={'Mindfulness'}
              value={localGoals.goal_mindfulness_minutes.toString()}
              icon={'sleep'}
              onChangeText={(value: string) =>
                handleOnGoalChanged(value, 'goal_mindfulness_minutes')
              }
              onEndEditing={handleOnGoalSubmitted}
            />
          </FieldsWrapper>
        </GoalChooserContainer>
      </KeyboardAvoidingView>
    </Wrapper>
  );
};
