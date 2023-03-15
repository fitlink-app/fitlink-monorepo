import React, {FC, useEffect} from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/core';
import {StackNavigationProp} from '@react-navigation/stack';

import {BfitButton, IAuthViewProps, IOnSuccessProps} from '@components';
import {AUTH_COOLDOWN_TIMEOUT} from '@constants';
import {RootStackParamList} from '@routes';

import PinCodeBiometryWrapper from './PinCodeBiometryWrapper';
import {
  clearLastPinErrorCountExceeded,
  incrementPinErrorCount,
  resetLastPinErrorCountExceeded,
  resetPinErrorCount,
  selectLastPinErrorCountExceeded,
  selectPinErrorsCount,
} from '../../redux/auth';
import {useAppDispatch} from '../../redux/store';

export const PinCodeWrapper: FC<
  Omit<IAuthViewProps, 'onErrorChange' | 'error'>
> = props => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const lastCountExceededTimestamp = useSelector(
    selectLastPinErrorCountExceeded,
  );
  const errorsCount = useSelector(selectPinErrorsCount);

  useEffect(() => {
    if (!lastCountExceededTimestamp) {
      return;
    }

    const cooldownEndTimestamp =
      lastCountExceededTimestamp + AUTH_COOLDOWN_TIMEOUT;
    const resetErrorState = () => {
      dispatch(resetPinErrorCount());
      dispatch(clearLastPinErrorCountExceeded());
    };

    if (cooldownEndTimestamp < Date.now()) {
      resetErrorState();
      return;
    }

    const timeLeftToCooldown = cooldownEndTimestamp - Date.now();
    const timeout = setTimeout(() => {
      resetErrorState();
    }, timeLeftToCooldown);

    return () => {
      clearTimeout(timeout);
    };
  }, [lastCountExceededTimestamp]);

  const onErrorChange = (hasError: boolean) => {
    if (!hasError) {
      return;
    }
    // TODO: Snackbar - show pin error
    if (errorsCount >= 9) {
      dispatch(resetLastPinErrorCountExceeded());
    }
    dispatch(incrementPinErrorCount());
  };

  if (
    lastCountExceededTimestamp &&
    lastCountExceededTimestamp + AUTH_COOLDOWN_TIMEOUT > Date.now()
  ) {
    return (
      <View>
        <Text>
          Cooldown in {lastCountExceededTimestamp + AUTH_COOLDOWN_TIMEOUT}
        </Text>
      </View>
    );
  }

  const onSuccess = (onSuccessProps: IOnSuccessProps) => {
    dispatch(resetPinErrorCount());
    props.onSuccess(onSuccessProps);
  };

  return (
    <PinCodeBiometryWrapper
      {...props}
      onSuccess={onSuccess}
      onErrorChange={onErrorChange}
    >
      {errorsCount >= 3 && (
        <BfitButton
          variant="primary"
          text="Reset pin-code"
          onPress={() => {
            // TODO: navigate to Reset pin code
          }}
        />
      )}
    </PinCodeBiometryWrapper>
  );
};

export default PinCodeWrapper;
