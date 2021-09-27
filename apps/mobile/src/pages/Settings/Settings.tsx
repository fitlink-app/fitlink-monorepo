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
import {
  ImagePickerDialogResponse,
  useImagePicker,
  useStrava,
  useMe,
  useModal,
  useProviders,
  useFitbit,
} from '@hooks';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {Keyboard, Platform, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {
  CategoryLabel,
  SettingsButton,
  SettingsInput,
  SettingsDropdown,
  SettingsHealthActivityButton,
} from './components';
import {SettingsItemWrapper} from './components/SettingsItemWrapper';
import {SettingsItemLabel} from './components/SettingsItemLabel';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from 'redux/store';
import {logout} from 'redux/auth/authSlice';
import {
  clearChanges,
  PRIVACY_ITEMS,
  selectDidSettingsChange,
  selectSettings,
  setActivitiesPrivacy,
  setAvatar,
  setDailyStatisticsPrivacy,
  setGoals,
  setName,
  setNewsletterSubscription,
  setState,
  setUnitSystem,
  submit,
  UserGoalPreferences,
} from 'redux/settings/settingsSlice';
import {useEffect} from 'react';
import {TransitionContext} from 'contexts';

const Wrapper = styled.View({flex: 1});

const DeleteButtonWrapper = styled.View(() => ({
  paddingHorizontal: 20,
  marginTop: 15,
}));

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

type UserGoalPreferencesString = {
  [K in keyof UserGoalPreferences]: string;
};

export const Settings = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch() as AppDispatch;

  const {openModal, closeModal} = useModal();
  const {openImagePicker} = useImagePicker();
  const {showTransition, hideTransition} = useContext(TransitionContext);

  const {data: user} = useMe();
  const {providerList} = useProviders();

  const {isLinking: isStravaLinking, link: linkStrava} = useStrava();
  const {isLinking: isFitbitLinking, link: linkFitbit} = useFitbit();

  const settings = useSelector(selectSettings);
  const didSettingsChange = useSelector(selectDidSettingsChange);

  const [isInitialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user && !isInitialized) {
      dispatch(clearChanges());

      console.log('hey');
      console.log(user?.settings?.newsletter_subscriptions_user);
      console.log(user.settings);

      const newState = {
        name: user?.name || '',
        unitSystem: user?.unit_system || UnitSystem.Imperial,
        timezone: user.timezone,
        avatar: user.avatar,
        goals: {
          goal_mindfulness_minutes: user?.goal_mindfulness_minutes || 0,
          goal_steps: user?.goal_steps || 0,
          goal_floors_climbed: user?.goal_floors_climbed || 0,
          goal_water_litres: user?.goal_water_litres || 0,
          goal_sleep_hours: user?.goal_sleep_hours || 0,
        },
        userSettings: {
          newsletter_subscriptions_user:
            user?.settings?.newsletter_subscriptions_user,
          privacy_activities: user?.settings?.privacy_activities,
          privacy_daily_statistics: user?.settings?.privacy_daily_statistics,
        },
      };

      dispatch(setState(newState));

      setLocalGoals(initializeGoalsFromNumericSource(newState.goals));

      setInitialized(true);
    }
  }, [user]);

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
    setLocalGoals(prevGoals => ({
      ...(prevGoals || ({} as any)),
      [field]: formattedValue,
    }));
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

  const handleOnAvatarPicked = (response: ImagePickerDialogResponse) => {
    dispatch(setAvatar(response));
  };

  const handleOnSavePressed = async () => {
    Keyboard.dismiss();

    showTransition('Saving changes...');

    await dispatch(submit());

    hideTransition();

    navigation.goBack();
  };

  return (
    <Wrapper>
      <Navbar
        rightComponent={
          didSettingsChange ? (
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
            <Avatar
              url={settings.tempAvatar?.uri || settings.avatar?.url_512x512}
              size={44}
              style={{marginRight: 10}}
            />
          }
          label={'Update image'}
          onPress={() =>
            openImagePicker('Select Avatar', response => {
              handleOnAvatarPicked(response);
            })
          }
        />
        <SettingsInput
          label={'Display name'}
          value={settings.name}
          onChangeText={text => dispatch(setName(text))}
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

        {Platform.OS === 'android' && (
          <SettingsHealthActivityButton
            label={'Google Fit'}
            onLink={() => {}}
            onUnlink={() => {}}
            isLoading={false}
            isLinked={providerList?.includes('google_fit')}
          />
        )}

        {Platform.OS === 'ios' && (
          <SettingsHealthActivityButton
            label={'Apple Health'}
            onLink={() => {}}
            onUnlink={() => {}}
            isLoading={false}
            isLinked={providerList?.includes('apple_health')}
          />
        )}

        <SettingsHealthActivityButton
          label={'Strava'}
          onLink={linkStrava}
          onUnlink={() => {}}
          isLoading={isStravaLinking}
          isLinked={providerList?.includes('strava')}
        />

        <SettingsHealthActivityButton
          label={'Fitbit'}
          onLink={linkFitbit}
          onUnlink={() => {}}
          isLoading={isFitbitLinking}
          isLinked={providerList?.includes('fitbit')}
        />

        {/* Goals */}
        <CategoryLabel>Goals</CategoryLabel>
        <SettingsInput
          label={'Steps'}
          value={localGoals.goal_steps.toString()}
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
          value={localGoals.goal_floors_climbed.toString()}
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
          value={localGoals.goal_water_litres.toString()}
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
          value={localGoals.goal_sleep_hours.toString()}
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
          value={localGoals.goal_mindfulness_minutes.toString()}
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
          onPress={() => dispatch(setUnitSystem(UnitSystem.Imperial))}
        />
        <SettingsButton
          label={'Kilometres'}
          accent={settings.unitSystem === 'metric'}
          icon={settings.unitSystem === 'metric' ? 'check' : 'none'}
          onPress={() => dispatch(setUnitSystem(UnitSystem.Metric))}
        />

        {/* Privacy */}
        <CategoryLabel>Privacy</CategoryLabel>
        <SettingsDropdown
          label={'Daily Statistics'}
          items={PRIVACY_ITEMS}
          value={settings.userSettings?.privacy_daily_statistics}
          onValueChange={value => dispatch(setDailyStatisticsPrivacy(value))}
          prompt={'Select daily statistics privacy'}
        />
        <SettingsDropdown
          label={'Activities'}
          items={PRIVACY_ITEMS}
          value={settings.userSettings?.privacy_activities}
          onValueChange={value => dispatch(setActivitiesPrivacy(value))}
          prompt={'Select activity privacy'}
        />

        {/* Newsletter */}
        <CategoryLabel>Newsletter</CategoryLabel>
        <SettingsItemWrapper>
          <Row>
            <SettingsItemLabel children={'Subscribe to newsletter'} />
            <Checkbox
              onPress={() =>
                dispatch(
                  setNewsletterSubscription(
                    !settings.userSettings?.newsletter_subscriptions_user,
                  ),
                )
              }
              checked={!!settings.userSettings?.newsletter_subscriptions_user}
            />
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
