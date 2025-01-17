import React, {useContext, useEffect, useState} from 'react';
import {Keyboard, Linking, Platform, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';

import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Label,
  Modal,
  Navbar,
  NAVBAR_HEIGHT,
  TouchHandler,
} from '@components';
import {
  ImagePickerDialogResponse,
  useFitbit,
  useImagePicker,
  useMe,
  useModal,
  useProviders,
  useStrava,
} from '@hooks';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import Intercom from '@intercom/intercom-react-native';
import {widthLize} from '@utils';

import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {SettingsItemWrapper} from './components/SettingsItemWrapper';
import {SettingsItemLabel} from './components/SettingsItemLabel';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from 'redux/store';
import {logout} from 'redux/auth';
import {TransitionContext} from 'contexts';
import {useCustomProvider} from 'hooks/api/providers/custom';
import {GoogleFitWrapper} from 'services/GoogleFit';
import {AppleHealthKitWrapper} from 'services';
import {
  clearChanges,
  CURRENCY_ITEMS,
  PRIVACY_ITEMS,
  selectDidSettingsChange,
  selectSettings,
  setActivitiesPrivacy,
  setAvatar,
  setDailyStatisticsPrivacy,
  setDisplayCurrency,
  setGoals,
  setName,
  setNewsletterSubscription,
  setState,
  setUnitSystem,
  submit,
  UserGoalPreferences,
} from 'redux/settings/settingsSlice';
import {
  CategoryLabel,
  DeleteAccountModal,
  ConnectGoogleFitBanner,
  SettingsButton,
  SettingsDropdown,
  SettingsHealthActivityButton,
  SettingsInput,
  BiometrySettingsButton,
} from './components';
import {useDefaultOkSnackbar} from 'components/snackbar';

const Wrapper = styled.View({flex: 1});

const DeleteButtonWrapper = styled.View(() => ({
  paddingHorizontal: 20,
  marginTop: 15,
}));

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const CategoryCard = styled(Card)({
  borderRadius: 31,
  paddingHorizontal: 7,
  paddingTop: 5,
  paddingBottom: 10,
  marginTop: 20,
});

const CategoryTitle = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'accent',
}))(() => ({
  paddingLeft: 20,
}));

type UserGoalPreferencesString = {
  [K in keyof UserGoalPreferences]: string;
};

export const Settings = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch() as AppDispatch;
  const showOkSnackbar = useDefaultOkSnackbar();

  const {openModal, closeModal} = useModal();
  const {openImagePicker} = useImagePicker();
  const {showTransition, hideTransition} = useContext(TransitionContext);

  const {data: user} = useMe();
  const {data: providerList} = useProviders();

  const {
    isLinking: isStravaLinking,
    isUnlinking: isStravaUnlinking,
    link: linkStrava,
    unlink: unlinkStrava,
  } = useStrava();

  const {
    isLinking: isFitbitLinking,
    isUnlinking: isFitbitUnlinking,
    link: linkFitbit,
    unlink: unlinkFitbit,
  } = useFitbit();

  const {
    isLinking: isAppleHealthLinking,
    isUnlinking: isAppleHealthUnlinking,
    link: linkAppleHealth,
    unlink: unlinkAppleHealth,
  } = useCustomProvider(ProviderType.AppleHealthkit);

  const {
    isLinking: isGoogleFitLinking,
    isUnlinking: isGoogleFitUnlinking,
    link: linkGoogleFit,
    unlink: unlinkGoogleFit,
  } = useCustomProvider(ProviderType.GoogleFit);

  const settings = useSelector(selectSettings);
  const didSettingsChange = useSelector(selectDidSettingsChange);

  const [isInitialized, setInitialized] = useState(false);

  const withSuccessSnackbar = async (linkCallback: () => Promise<unknown>) => {
    try {
      await linkCallback();
    } catch (e) {
      console.error('FUCK', e);
    }
    showOkSnackbar('Linked Successfully');
  };

  useEffect(() => {
    if (user && providerList && !isInitialized) {
      dispatch(clearChanges());

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
          goal_active_minutes: user?.goal_active_minutes || 0,
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
  }, [user, providerList, isInitialized, dispatch]);

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
      goal_active_minutes: source.goal_active_minutes.toString(),
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

      if (isNaN(parsedValue)) {
        parsedValue = 0;
      }
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

  const teamName = () => {
    if (user?.teams) {
      const filterList = user.teams.filter(team => team.user_count > 0);
      if (filterList.length > 0) {
        return filterList[0].name + ' Team';
      } else {
        return 'Not in a team';
      }
    } else {
      return 'Not in a team';
    }
  };

  const openGoogleFitConnectionModal = async () => {
    openModal(modalId => (
      <ConnectGoogleFitBanner
        connect={() =>
          withSuccessSnackbar(async () => {
            try {
              await linkGoogleFit(() => {
                return GoogleFitWrapper.authenticate();
              });
            } catch (e) {
              throw e;
            } finally {
              closeModal(modalId);
            }
          })
        }
      />
    ));
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
        iconColor={'white'}
        title="SETTINGS"
        titleStyle={{fontSize: 15, color: '#00E9D7', letterSpacing: 1}}
        overlay
      />
      <ScrollView
        contentContainerStyle={{
          marginTop: NAVBAR_HEIGHT + insets.top,
          paddingBottom: NAVBAR_HEIGHT + insets.top + insets.bottom + 20,
          paddingHorizontal: 20,
        }}
      >
        {/* Account Settings */}
        <CategoryCard>
          <Row
            style={{
              alignItems: 'center',
              marginTop: 20,
            }}
          >
            <View>
              <CategoryTitle>Account</CategoryTitle>
            </View>
            <View style={{marginRight: widthLize(20)}}>
              <Button
                text={'Logout'}
                containerStyle={{
                  width: widthLize(66),
                  height: 26,
                  backgroundColor: '#ACACAC',
                }}
                textStyle={{
                  fontSize: 14,
                  color: '#181818',
                }}
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
                                showOkSnackbar('You have been logged out.');
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
            </View>
          </Row>
          <SettingsButton
            preLabelComponent={
              <Avatar
                url={settings.tempAvatar?.uri || settings.avatar?.url_512x512}
                size={44}
                style={{marginRight: 10}}
              />
            }
            label={'Update Image'}
            onPress={() =>
              openImagePicker('Select Avatar', response => {
                handleOnAvatarPicked(response);
              })
            }
            profileRow={true}
          />
          <SettingsInput
            label={'Display Name'}
            value={settings.name}
            onChangeText={text => dispatch(setName(text))}
            autoCapitalize={'words'}
            keyboardType={'default'}
            returnKeyType={'done'}
            displayName
          />
          <SettingsDropdown
            label="Display Currency"
            items={CURRENCY_ITEMS}
            value={settings.displayCurrency}
            prompt="Select your currency"
            valueTextWidth={50}
            onValueChange={value => {
              dispatch(setDisplayCurrency(value));
            }}
          />
          <SettingsButton
            label={'Email Address'}
            onPress={() => {
              navigation.navigate('UpdateEmail');
            }}
          />
          <SettingsButton
            label={'Update Password'}
            onPress={() => navigation.navigate('UpdatePassword')}
          />
          <SettingsButton
            label="Change Pin Code"
            onPress={() => navigation.navigate('ChangePinCodeScreen')}
          />
          <BiometrySettingsButton />
          <SettingsInput
            label={'Team'}
            value={teamName()}
            editable={false}
            displayName
          />
        </CategoryCard>

        {/* Linked Trackers */}
        <CategoryCard>
          <CategoryLabel>Trackers</CategoryLabel>
          {Platform.OS === 'android' && (
            <SettingsHealthActivityButton
              label={'Google Fit'}
              onLink={openGoogleFitConnectionModal}
              onUnlink={() => {
                GoogleFitWrapper.disconnect();
                unlinkGoogleFit();
              }}
              isLoading={isGoogleFitLinking || isGoogleFitUnlinking}
              disabled={isGoogleFitLinking || isGoogleFitUnlinking}
              isLinked={!!providerList?.includes(ProviderType.GoogleFit)}
            />
          )}

          {Platform.OS === 'ios' && (
            <SettingsHealthActivityButton
              label={'Apple Health'}
              onLink={() =>
                withSuccessSnackbar(async () => {
                  await linkAppleHealth(() =>
                    AppleHealthKitWrapper.authenticate(),
                  );
                })
              }
              onUnlink={unlinkAppleHealth}
              isLoading={isAppleHealthLinking || isAppleHealthUnlinking}
              disabled={isAppleHealthLinking || isAppleHealthUnlinking}
              isLinked={!!providerList?.includes(ProviderType.AppleHealthkit)}
            />
          )}

          <SettingsHealthActivityButton
            label={'Strava'}
            onLink={() => withSuccessSnackbar(linkStrava)}
            onUnlink={unlinkStrava}
            isLoading={isStravaLinking || isStravaUnlinking}
            disabled={isStravaLinking || isStravaUnlinking}
            isLinked={!!providerList?.includes(ProviderType.Strava)}
          />

          <SettingsHealthActivityButton
            label={'Fitbit'}
            onLink={() => withSuccessSnackbar(linkFitbit)}
            onUnlink={unlinkFitbit}
            isLoading={isFitbitLinking || isFitbitUnlinking}
            disabled={isFitbitLinking || isFitbitUnlinking}
            isLinked={!!providerList?.includes(ProviderType.Fitbit)}
          />
        </CategoryCard>

        {/* Goals */}
        <CategoryCard>
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
            label={'Water (Litres)'}
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
            label={'Sleep (Hours)'}
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
            label={'Mindfulness (Minutes)'}
            value={localGoals.goal_mindfulness_minutes.toString()}
            onChangeText={(text: string) =>
              handleOnGoalChanged(text, 'goal_mindfulness_minutes')
            }
            onEndEditing={handleOnGoalSubmitted}
            autoCapitalize={'words'}
            keyboardType={'numeric'}
            returnKeyType={'done'}
          />
          <SettingsInput
            label={'Active Minutes'}
            value={localGoals.goal_active_minutes.toString()}
            onChangeText={(text: string) =>
              handleOnGoalChanged(text, 'goal_active_minutes')
            }
            onEndEditing={handleOnGoalSubmitted}
            autoCapitalize={'words'}
            keyboardType={'numeric'}
            returnKeyType={'done'}
          />
        </CategoryCard>

        {/* Units */}
        <CategoryCard>
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
        </CategoryCard>

        {/* Privacy */}
        <CategoryCard>
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
        </CategoryCard>

        {/* Newsletter */}
        <CategoryCard>
          <CategoryLabel>Newsletter</CategoryLabel>
          <SettingsItemWrapper
            style={{borderTopWidth: 1, borderColor: '#2e2e2e'}}
          >
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
        </CategoryCard>

        {/* Help */}
        <CategoryCard>
          <CategoryLabel>Help</CategoryLabel>
          <SettingsButton
            label={'FAQs'}
            onPress={() => Intercom.displayHelpCenter()}
          />
          <SettingsButton
            label={'E-mail us'}
            onPress={() => Linking.openURL('mailto:hello@bfitcoin.com')}
          />

          <SettingsButton
            label={'Report an Issue'}
            onPress={() => Linking.openURL('mailto:support@bfitcoin.com')}
          />

          <SettingsButton
            label={`Version ${DeviceInfo.getVersion()}`}
            disabled={true}
          />
        </CategoryCard>

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
                  >
                    <DeleteAccountModal
                      onCloseCallback={isDeleted => {
                        closeModal(id);
                        if (!isDeleted) {
                          return;
                        }

                        setTimeout(() => {
                          showOkSnackbar('Your account has been deleted!');
                        }, 250);
                      }}
                    />
                  </Modal>
                );
              })
            }
          />
        </DeleteButtonWrapper>
      </ScrollView>
    </Wrapper>
  );
};
