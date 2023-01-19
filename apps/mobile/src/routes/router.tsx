import {
  DefaultTheme,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import React from 'react';
import {useTheme} from 'styled-components/native';
import {AuthenticationNavigator} from './Authentication';
import {HomeNavigator} from './Home';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {RootStackParamList} from './types';
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
} from 'pages';
import {SettingsNavigator} from './Settings';
import {useSelector} from 'react-redux';
import {memoSelectIsAuthenticated} from 'redux/auth/authSlice';
import {Onboarding} from 'pages/Onboarding';
import {CustomInterpolators} from './interpolators';
import {useMe} from '@hooks';

const Stack = createStackNavigator<RootStackParamList>();

// Exports a reference to the navigation object for cases when the navigation prop is not available
export const navigationRef = React.createRef<NavigationContainerRef | null>();

export default function Router() {
  const {colors} = useTheme();

  const isAuthenticated = useSelector(memoSelectIsAuthenticated);
  const {data: me} = useMe();

  const navigatorOptions = {
    cardShadowEnabled: true,
    cardOverlayEnabled: true,
    headerShown: false,
  };

  return (
    <NavigationContainer
      ref={navigationRef as any}
      theme={{
        ...DefaultTheme,
        colors: {...DefaultTheme.colors, background: colors.background},
      }}>
      <Stack.Navigator screenOptions={navigatorOptions}>
        {isAuthenticated ? (
          me?.onboarded ? (
            <>
              <Stack.Screen name={'HomeNavigator'} component={HomeNavigator} />
              <Stack.Screen
                name={'Settings'}
                component={SettingsNavigator}
                options={{
                  cardStyleInterpolator:
                    CustomInterpolators.forVerticalWithOverlay,
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
                  cardStyleInterpolator:
                    CustomInterpolators.forVerticalWithOverlay,
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
            </>
          ) : (
            <Stack.Screen name={'Onboarding'} component={Onboarding} />
          )
        ) : (
          <Stack.Screen
            name={'AuthenticationNavigator'}
            component={AuthenticationNavigator}
            options={{
              animationTypeForReplace: undefined,
              animationEnabled: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
