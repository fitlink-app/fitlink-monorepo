import {Avatar, Button, Navbar, NAVBAR_HEIGHT} from '@components';
import {UserGoalPreferences, useSettings} from '@hooks';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Platform, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {
  CategoryLabel,
  SettingsButton,
  SettingsInput,
  SettingsDropdown,
} from './components';

const Wrapper = styled.View({flex: 1});

const DeleteButtonWrapper = styled.View(() => ({
  paddingHorizontal: 20,
  marginTop: 15,
}));

const PRIVACY_ITEMS = [
  {
    label: 'Private',
    value: 'private',
  },
  {
    label: 'Followers',
    value: 'followers',
  },
  {
    label: 'Public',
    value: 'public',
  },
];

type UserGoalPreferencesString = {
  [K in keyof UserGoalPreferences]: string;
};

export const Settings = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const settings = useSettings();

  // TODO: Hook up with state
  // TODO: Add Avatar url once API supports it
  // TODO: Implement tracker onPress

  /**
   * We keep track of the goal input values in a local state
   * and only put them into Settings state once the field is submitted
   * because it needs to be parsed and validated
   */
  const initializeGoalsFromNumericSource = (source: UserGoalPreferences) => {
    return {
      goal_mindfulness_minutes: source.goal_mindfulness_minutes.toString(),
      goal_steps: source.goal_steps.toString(),
      goal_floors_climbed: source.goal_floors_climbed.toString(),
      goal_water_litres: source.goal_water_litres.toString(),
      goal_sleep_hours: source.goal_sleep_hours.toString(),
    };
  };

  const [goals, setGoals] = useState<UserGoalPreferencesString>(
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
    setGoals(prevGoals => ({...prevGoals, [field]: formattedValue}));
  };

  /**
   * Invoked when editing a goal field's value is ended
   *
   * This function will parse and transfer the local goal state
   * to the settings hook state
   */
  const handleOnGoalSubmitted = () => {
    let parsedGoals = settings.goals;

    for (const property in goals) {
      let parsedValue = parseFloat(
        goals[property as keyof UserGoalPreferencesString],
      );
      if (isNaN(parsedValue)) parsedValue = 0;
      parsedGoals[property as keyof UserGoalPreferences] = parsedValue;
    }

    setGoals(initializeGoalsFromNumericSource(parsedGoals));
    settings.setGoals(parsedGoals);
  };

  return (
    <Wrapper>
      <Navbar backButtonIcon={'times'} title="Settings" overlay />
      <ScrollView
        contentContainerStyle={{
          marginTop: NAVBAR_HEIGHT + insets.top,
          paddingBottom: NAVBAR_HEIGHT + insets.top + insets.bottom + 20,
        }}>
        {/* Profile Settings */}
        <CategoryLabel>Profile</CategoryLabel>
        <SettingsButton
          preLabelComponent={
            <Avatar url={undefined} size={44} style={{marginRight: 10}} />
          }
          label={'Update image'}
          onPress={() => {
            // TODO: Show image picker modal (take pic, select from gallery, cancel)
          }}
        />
        <SettingsInput
          label={'Display name'}
          value={settings.name}
          onChangeText={settings.setName}
          autoCapitalize={'words'}
          keyboardType={'default'}
          returnKeyType={'done'}
        />
        <SettingsButton
          label={'E-mail address'}
          onPress={() => {
            // TODO: Navigate to update email address screen
          }}
        />
        <SettingsButton
          label={'Update password'}
          onPress={() => {
            // TODO: Navigate to update password screen
          }}
        />
        <SettingsButton
          label={'Log out'}
          icon={'sign-out'}
          onPress={() => {
            // TODO: Show logout confirmation modal
          }}
        />

        {/* Linked Trackers */}
        <CategoryLabel>Trackers</CategoryLabel>
        {Platform.OS === 'android' && <SettingsButton label={'Google Fit'} />}
        {Platform.OS === 'ios' && <SettingsButton label={'Apple Health'} />}
        <SettingsButton label={'Strava'} />
        <SettingsButton label={'Fitbit'} />

        {/* Goals */}
        <CategoryLabel>Goals</CategoryLabel>
        <SettingsInput
          label={'Steps'}
          value={goals.goal_steps.toString()}
          onChangeText={(text: string) =>
            handleOnGoalChanged(text, 'goal_steps')
          }
          onEndEditing={handleOnGoalSubmitted}
          autoCapitalize={'words'}
          keyboardType={'numeric'}
          returnKeyType={'done'}
        />
        <SettingsInput
          label={'Floors'}
          value={goals.goal_floors_climbed.toString()}
          onChangeText={(text: string) =>
            handleOnGoalChanged(text, 'goal_floors_climbed')
          }
          onEndEditing={handleOnGoalSubmitted}
          autoCapitalize={'words'}
          keyboardType={'numeric'}
          returnKeyType={'done'}
        />
        <SettingsInput
          label={'Water (litres)'}
          value={goals.goal_water_litres.toString()}
          onChangeText={(text: string) =>
            handleOnGoalChanged(text, 'goal_water_litres')
          }
          onEndEditing={handleOnGoalSubmitted}
          autoCapitalize={'words'}
          keyboardType={'numeric'}
          returnKeyType={'done'}
        />
        <SettingsInput
          label={'Sleep (hours)'}
          value={goals.goal_sleep_hours.toString()}
          onChangeText={(text: string) =>
            handleOnGoalChanged(text, 'goal_sleep_hours')
          }
          onEndEditing={handleOnGoalSubmitted}
          autoCapitalize={'words'}
          keyboardType={'numeric'}
          returnKeyType={'done'}
        />
        <SettingsInput
          label={'Mindfulness (minutes)'}
          value={goals.goal_mindfulness_minutes.toString()}
          onChangeText={(text: string) =>
            handleOnGoalChanged(text, 'goal_mindfulness_minutes')
          }
          onEndEditing={handleOnGoalSubmitted}
          autoCapitalize={'words'}
          keyboardType={'numeric'}
          returnKeyType={'done'}
        />

        {/* Units */}
        <CategoryLabel>Units</CategoryLabel>

        <SettingsButton label={'Miles'} accent={true} icon={'check'} />
        <SettingsButton label={'Kilometres'} accent={false} icon={'none'} />

        {/* Privacy */}
        <CategoryLabel>Privacy</CategoryLabel>
        <SettingsDropdown
          label={'Daily Statistics'}
          items={PRIVACY_ITEMS}
          value={PRIVACY_ITEMS[0].value}
          prompt={'Select daily statistics privacy'}
        />
        <SettingsDropdown
          label={'Activities'}
          items={PRIVACY_ITEMS}
          value={PRIVACY_ITEMS[0].value}
          prompt={'Select activity privacy'}
        />

        {/* Help */}
        <CategoryLabel>Help</CategoryLabel>
        <SettingsButton
          label={'FAQs'}
          onPress={() =>
            navigation.navigate('Webview', {
              url: 'https://fitlinkapp.com/faq-user',
              title: 'FAQs',
            })
          }
        />
        <SettingsButton
          label={'Contact Us'}
          onPress={() =>
            navigation.navigate('Webview', {
              url: 'https://fitlinkapp.com/contact-us',
              title: 'Contact Us',
            })
          }
        />
        <SettingsButton
          label={'About'}
          onPress={() =>
            navigation.navigate('Webview', {
              url: 'https://fitlinkapp.com/about',
              title: 'About',
            })
          }
        />

        <SettingsButton label={'Report an Issue'} />

        <SettingsButton label={`Version 3.0.0`} />

        <DeleteButtonWrapper>
          <Button text={'Delete my account'} type={'danger'} />
        </DeleteButtonWrapper>
      </ScrollView>
    </Wrapper>
  );
};
