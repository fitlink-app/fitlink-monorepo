import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {StackNavigationProp} from '@react-navigation/stack';

import {RootStackParamList} from '@routes';

import PinCodeConfirmationSteps from './components/PinCodeConfirmationSteps';

type NavigationType = StackNavigationProp<
  RootStackParamList,
  'ChangePinCodeScreen'
>;

export const ChangePinCodeScreen = () => {
  const navigation = useNavigation<NavigationType>();

  return (
    <PinCodeConfirmationSteps
      initStepHeader="Change Pin Code"
      confirmStepHeader="Confirm Pin Code"
      onFinishSuccess={() => navigation.pop()}
    />
  );
};

export default ChangePinCodeScreen;
