import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

// Screens
import {Welcome} from '../pages';

export const WelcomeNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name={'Welcome'} component={Welcome} />
    </Stack.Navigator>
  );
};
