import {
  Avatar,
  Button,
  Checkbox,
  Label,
  Modal,
  Navbar,
  NAVBAR_HEIGHT,
  TouchHandler,
} from '@components';
import {useModal, UserGoalPreferences, useSettings} from '@hooks';
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Keyboard, Platform, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {
  CategoryLabel,
  SettingsButton,
  SettingsInput,
  SettingsDropdown,
} from './components';
import {SettingsItemWrapper} from './components/SettingsItemWrapper';
import {SettingsItemLabel} from './components/SettingsItemLabel';
import {useDispatch} from 'react-redux';
import {AppDispatch} from 'redux/store';
import {logout} from 'redux/auth/authSlice';

const Wrapper = styled.View({flex: 1});

const DeleteButtonWrapper = styled.View(() => ({
  paddingHorizontal: 20,
  marginTop: 15,
}));

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

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
  const dispatch = useDispatch() as AppDispatch;

  const settings = useSettings();
  const {openModal, closeModal} = useModal();

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

  const handleOnSavePressed = async () => {
    Keyboard.dismiss();

    // TODO: Show loading overlay

    await settings.submit();
    navigation.goBack();
  };

  return (
    <Wrapper>
      <Navbar
        rightComponent={
          settings.didSettingsChange ? (
            <TouchHandler onPress={handleOnSavePressed}>
              <Label bold appearance={'accent'}>
                Save
              </Label>
            </TouchHandler>
          ) : undefined
        }
        backButtonIcon={'times'}
        title="Settings"
        overlay
      />
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
            navigation.navigate('UpdateEmail');
          }}
        />
        <SettingsButton
          label={'Update password'}
          onPress={() => navigation.navigate('UpdatePassword')}
        />
        <SettingsButton
          label={'Log out'}
          icon={'sign-out'}
          onPress={() => {
            openModal(id => {
              return (
                <Modal
                  title={'Log out'}
                  description={'Are you sure you want to log out?'}
                  buttons={[
                    {
                      text: 'Log out',
                      type: 'danger',
                      onPress: () => {
                        closeModal(id, () => {
                          openModal(confirmationModalId => {
                            return (
                              <Modal
                                title={'Logged Out'}
                                description={'You have been logged out.'}
                                buttons={[
                                  {
                                    text: 'Ok',
                                    onPress: () =>
                                      closeModal(confirmationModalId),
                                  },
                                ]}
                              />
                            );
                          });
                        });

                        dispatch(logout());
                      },
                    },
                    {
                      text: 'Stay',
                      textOnly: true,
                      onPress: () => closeModal(id),
                    },
                  ]}
                />
              );
            });
          }}
        />

        {/* Linked Trackers */}
        <CategoryLabel>Trackers</CategoryLabel>
        {Platform.OS === 'android' && <SettingsButton label={'Google Fit'} />}
        {Platform.OS === 'ios' && <SettingsButton label={'Apple Health'} />}
        <SettingsButton label={'Strava'} onPress={() => {}} />
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

        <SettingsButton
          label={'Miles'}
          accent={settings.unitSystem === 'imperial'}
          icon={settings.unitSystem === 'imperial' ? 'check' : 'none'}
          onPress={() => settings.setUnitSystem('imperial' as UnitSystem)}
        />
        <SettingsButton
          label={'Kilometres'}
          accent={settings.unitSystem === 'metric'}
          icon={settings.unitSystem === 'metric' ? 'check' : 'none'}
          onPress={() => settings.setUnitSystem('metric' as UnitSystem)}
        />

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

        {/* Newsletter */}
        <CategoryLabel>Newsletter</CategoryLabel>
        <SettingsItemWrapper>
          <Row>
            <SettingsItemLabel children={'Subscribe to newsletter'} />
            <Checkbox onPress={() => {}} checked={false} />
          </Row>
        </SettingsItemWrapper>

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
          <Button
            text={'Delete my account'}
            type={'danger'}
            onPress={() =>
              openModal(id => {
                return (
                  <Modal
                    title={'Delete Account?'}
                    description={
                      'Are you sure you want to delete your account? This action is irreversible.'
                    }
                    buttons={[
                      {
                        text: 'Delete My Account',
                        type: 'danger',
                        onPress: () => closeModal(id),
                      },
                      {
                        text: 'Back',
                        textOnly: true,
                        style: {marginBottom: -10},
                        onPress: () => closeModal(id),
                      },
                    ]}
                  />
                );
              })
            }
          />
        </DeleteButtonWrapper>
      </ScrollView>
    </Wrapper>
  );
};
