import React from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {Settings, UpdateEmail, UpdatePassword} from 'pages';
import {CustomInterpolators} from 'routes/interpolators';

const Stack = createStackNavigator<RootStackParamList>();

const navigatorOptions = {
  headerShown: false,
  cardShadowEnabled: true,
};

export const SettingsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      <Stack.Screen
        name={'Settings'}
        component={Settings}
        options={{
          cardStyleInterpolator: CustomInterpolators.forVerticalWithOverlay,
        }}
      />

      <Stack.Screen
        name={'UpdateEmail'}
        component={UpdateEmail}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name={'UpdatePassword'}
        component={UpdatePassword}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  );
};
