import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {WelcomeNavigator} from './welcome.navigator';

const Stack = createStackNavigator();

// Exports a reference to the navigation object for cases when the navigation prop is not available
export const navigationRef = React.createRef<NavigationContainerRef | null>();

export default function Router() {
  return (
    <NavigationContainer ref={navigationRef as any}>
      <WelcomeNavigator />
    </NavigationContainer>
  );
}
