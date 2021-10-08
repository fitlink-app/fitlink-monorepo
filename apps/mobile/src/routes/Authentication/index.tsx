import React from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {Welcome, SignIn, SignUp, ForgotPassword} from '../../pages';
import {RootStackParamList} from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const navigatorOptions = {
  headerShown: false,
  cardShadowEnabled: true,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

export const AuthenticationNavigator = () => {
  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      <Stack.Screen name={'Welcome'} component={Welcome} />
      <Stack.Screen name={'SignIn'} component={SignIn} />
      <Stack.Screen name={'SignUp'} component={SignUp} />
      <Stack.Screen name={'ForgotPassword'} component={ForgotPassword} />
    </Stack.Navigator>
  );
};
