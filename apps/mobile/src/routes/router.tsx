import React from 'react';
import {NavigationContainerRef} from '@react-navigation/native';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';

import {
  League,
  LeagueForm,
  LeagueInviteFriends,
  Profile,
  Reward,
  Route,
  Webview,
  MyActivities,
  ActivityForm,
  Notifications,
  ActivityPage,
  Friends,
  Wallet,
  CheatingReportScreen,
  Onboarding,
  EnterPinCodeScreen,
  RootLoadingScreen,
} from '@pages';
import {
  selectIsAuthenticated,
  selectClientSideAccessGrantedAt,
} from '../redux/auth';

import {SettingsNavigator} from './Settings';
import {CustomInterpolators} from './interpolators';
import {getDefaultStackScreenOptions} from './options';
import {AuthenticationNavigator} from './Authentication';
import {HomeNavigator} from './Home';
import {RootStackParamList} from './types';
import {useAppSelector} from '../redux/store';

const Stack = createStackNavigator<RootStackParamList>();

// Exports a reference to the navigation object for cases when the navigation prop is not available
export const navigationRef = React.createRef<NavigationContainerRef>();

export default function Router() {
  const clientSideAccessGrantedAt = useAppSelector(
    selectClientSideAccessGrantedAt,
  );
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isMainFlowAvailable = !!(isAuthenticated && clientSideAccessGrantedAt);

  const navigatorOptions = {
    cardShadowEnabled: true,
    cardOverlayEnabled: true,
    headerShown: false,
  };

  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      {!isMainFlowAvailable && (
        <Stack.Screen
          name={'AuthenticationNavigator'}
          component={AuthenticationNavigator}
          options={{
            animationTypeForReplace: undefined,
            animationEnabled: false,
          }}
        />
      )}
      {isMainFlowAvailable && (
        <>
          <Stack.Screen
            name="RootLoadingScreen"
            component={RootLoadingScreen}
          />
          <Stack.Screen name={'Onboarding'} component={Onboarding} />

          <Stack.Screen name={'HomeNavigator'} component={HomeNavigator} />
          <Stack.Screen
            name={'Settings'}
            component={SettingsNavigator}
            options={{
              cardStyleInterpolator: CustomInterpolators.forVerticalWithOverlay,
            }}
          />
          <Stack.Screen name={'League'} component={League} />
          <Stack.Screen
            name={'LeagueInviteFriends'}
            component={LeagueInviteFriends}
          />
          <Stack.Screen
            name={'LeagueForm'}
            component={LeagueForm}
            options={{
              cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
            }}
          />
          <Stack.Screen name={'Profile'} component={Profile} />
          <Stack.Screen name={'Route'} component={Route} />
          <Stack.Screen name={'Reward'} component={Reward} />
          <Stack.Screen name={'Webview'} component={Webview} />
          <Stack.Screen
            name={'Notifications'}
            component={Notifications}
            options={{
              cardStyleInterpolator: CustomInterpolators.forVerticalWithOverlay,
            }}
          />
          <Stack.Screen
            name={'MyActivities'}
            component={MyActivities}
            options={{
              cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
            }}
          />
          <Stack.Screen name={'ActivityForm'} component={ActivityForm} />
          <Stack.Screen name={'ActivityPage'} component={ActivityPage} />
          <Stack.Screen name={'Friends'} component={Friends} />
          <Stack.Screen name={'Wallet'} component={Wallet} />
          <Stack.Screen
            name="CheatingReportScreen"
            component={CheatingReportScreen}
            options={getDefaultStackScreenOptions}
          />
          <Stack.Screen
            name="EnterPinCodeScreen"
            component={EnterPinCodeScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
