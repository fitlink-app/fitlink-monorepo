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
import {Webview} from 'pages';
import {CustomInterpolators} from './interpolators';
import {SettingsNavigator} from './Settings';

const Stack = createStackNavigator<RootStackParamList>();

// Exports a reference to the navigation object for cases when the navigation prop is not available
export const navigationRef = React.createRef<NavigationContainerRef | null>();

export default function Router() {
  const {colors} = useTheme();

  const {isLoggedIn} = useAuth();

  const navigatorOptions = {
    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
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
          <Stack.Screen name={'HomeNavigator'} component={HomeNavigator} />
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

        <Stack.Screen name={'Settings'} component={SettingsNavigator} />

        <Stack.Screen
          name={'Webview'}
          component={Webview}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
