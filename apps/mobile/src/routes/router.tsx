import {
  DefaultTheme,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import React from 'react';
import {useTheme} from 'styled-components/native';
import {useAuth} from '@hooks';
import {AuthenticationNavigator} from './Authentication';
import {HomeNavigator} from './Home';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {RootStackParamList} from './types';
import {League, LeagueInviteFriends, Profile, Webview} from 'pages';
import {SettingsNavigator} from './Settings';

const Stack = createStackNavigator<RootStackParamList>();

// Exports a reference to the navigation object for cases when the navigation prop is not available
export const navigationRef = React.createRef<NavigationContainerRef | null>();

export default function Router() {
  const {colors} = useTheme();

  const {isLoggedIn} = useAuth();

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
        {isLoggedIn ? (
          <>
            <Stack.Screen name={'HomeNavigator'} component={HomeNavigator} />
            <Stack.Screen
              name={'Settings'}
              component={SettingsNavigator}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            />
            <Stack.Screen name={'League'} component={League} />
            <Stack.Screen
              name={'LeagueInviteFriends'}
              component={LeagueInviteFriends}
            />
            <Stack.Screen name={'Profile'} component={Profile} />
            <Stack.Screen name={'Webview'} component={Webview} />
          </>
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
