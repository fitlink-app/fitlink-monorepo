import React, {FC, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

import theme from '@theme';
import {PinCodeView, BfitSpinner} from '@components';

import {useConfirmationStep, useInitializationStep} from '../hooks';

interface PinCodeConfirmationStepsProps {
  initStepHeader: string;
  confirmStepHeader: string;
  onFinishSuccess?: () => void;
}

export const PinCodeConfirmationSteps: FC<PinCodeConfirmationStepsProps> = ({
  initStepHeader,
  confirmStepHeader,
  onFinishSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [confirmingPin, setConfirmingPin] = useState('');
  const [isConfirmationStep, setIsConfirmationStep] = useState(false);

  const {onPinChange: onInitPinChange} = useInitializationStep({
    setPin,
    setConfirmingPin,
    setIsConfirmationStep,
  });

  const {
    showError,
    isLoading,
    onPinChange: onConfirmPiChange,
  } = useConfirmationStep({
    setPin,
    confirmingPin,
    onFinishSuccess,
    resetToCreation: () => setIsConfirmationStep(false),
  });

  const onPinChange = (value: string) => {
    if (isConfirmationStep) {
      onConfirmPiChange(value);
    } else {
      onInitPinChange(value);
    }
  };

  const heading = isConfirmationStep ? confirmStepHeader : initStepHeader;

  if (isLoading) {
    return <BfitSpinner wrapperStyle={styles.spinnerWrapper} />;
  }

  return (
    <SafeAreaView style={styles.safeView}>
      <PinCodeView
        pin={pin}
        title={heading}
        shouldAnimateOnError
        onPinChange={onPinChange}
        error={showError && "Pin Code doesn't match"}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
    paddingHorizontal: 18,
  },
  spinnerWrapper: {
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default PinCodeConfirmationSteps;
