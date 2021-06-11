import {
  DefaultTheme,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import React from 'react';
import {useTheme} from 'styled-components/native';
import {AuthenticationNavigator} from './authentication.navigator';

// Exports a reference to the navigation object for cases when the navigation prop is not available
export const navigationRef = React.createRef<NavigationContainerRef | null>();

export default function Router() {
  const {colors} = useTheme();

  return (
    <NavigationContainer
      ref={navigationRef as any}
      theme={{
        ...DefaultTheme,
        colors: {...DefaultTheme.colors, background: colors.background},
      }}>
      <AuthenticationNavigator />
    </NavigationContainer>
  );
}
