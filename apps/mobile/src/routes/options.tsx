import React from 'react';
import {TouchableOpacity} from 'react-native';
import {
  StackNavigationOptions,
  StackNavigationProp,
} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

import theme from '@theme';
import {Icon} from '@components';

import {RootStackParamList} from './types';

const routeToTitleMap: Partial<Record<keyof RootStackParamList, string>> = {
  CheatingReportScreen: 'Report',
  CreatePinCodeScreen: 'Login',
  EnterPinCodeScreen: 'Login',
  ChangePinCodeScreen: 'Change Pin',
  EnableBiometryPinCodeScreen: 'Enable Biometry',
  ActivityForm: 'Create Activity',
};

type ScreenOptionsCallbackProps = {
  route: RouteProp<RootStackParamList, keyof RootStackParamList>;
  navigation: StackNavigationProp<RootStackParamList>;
};

export const getDefaultStackScreenOptions = (
  props: ScreenOptionsCallbackProps,
): StackNavigationOptions => {
  const headerTitle = routeToTitleMap[props.route.name];
  return {
    ...defaultStackScreenOptions,
    headerTitle,
  };
};

export const getAbsoluteHeaderStackScreenOptions =
  (): StackNavigationOptions => {
    return {
      ...absoluteHeaderStackScreenOptions,
      headerTitle: '',
    };
  };

export const defaultStackScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitleAlign: 'center',
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: theme.colors.background,
  },
  headerTitleStyle: {
    fontSize: 14,
    color: theme.colors.accent,
    textTransform: 'uppercase',
  },
  headerLeft: ({canGoBack, onPress}) => {
    return ArrowBack(canGoBack, onPress);
  },
};

export const absoluteHeaderStackScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTransparent: true,
  headerLeft: ({canGoBack, onPress}) => {
    return ArrowBack(canGoBack, onPress);
  },
  headerStyle: {
    position: 'absolute',
    elevation: 100,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
};

const ArrowBack = (
  canGoBack: boolean | undefined,
  onPress: (() => void) | undefined,
) => {
  if (canGoBack) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          flex: 1,
          marginLeft: 18,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="arrow-left" color={theme.colors.text} size={22} />
      </TouchableOpacity>
    );
  }
  return null;
};
