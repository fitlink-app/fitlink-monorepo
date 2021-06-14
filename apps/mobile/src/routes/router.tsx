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

const Stack = createStackNavigator<RootStackParamList>();

// Exports a reference to the navigation object for cases when the navigation prop is not available
export const navigationRef = React.createRef<NavigationContainerRef | null>();

export default function Router() {
  const {colors} = useTheme();

  const {isLoggedIn} = useAuth();

  const navigatorOptions = {
    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
    cardShadowEnabled: true,
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
