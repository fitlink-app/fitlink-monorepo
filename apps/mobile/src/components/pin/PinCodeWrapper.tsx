import React, {FC, useEffect} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components/native';

import {IAuthViewProps, IOnSuccessProps} from '@components';
import {AUTH_COOLDOWN_TIMEOUT} from '@constants';
import theme from '@theme';

import PinCodeBiometryWrapper from './PinCodeBiometryWrapper';
import {
  clearLastPinErrorCountExceeded,
  incrementPinErrorCount,
  resetLastPinErrorCountExceeded,
  resetPinErrorCount,
  selectPinErrorCountExceededAt,
  selectPinErrorsCount,
} from '../../redux/auth';
import {useAppDispatch} from '../../redux/store';
import {Countdown} from './Countdown';

const NUMBER_OF_ATTEMPTS = 5;

export const PinCodeWrapper: FC<
  Omit<IAuthViewProps, 'onErrorChange' | 'error'>
> = props => {
  const dispatch = useAppDispatch();

  const lastCountExceededTimestamp = useSelector(selectPinErrorCountExceededAt);
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
    if (errorsCount >= NUMBER_OF_ATTEMPTS - 1) {
      dispatch(resetLastPinErrorCountExceeded());
    }
    dispatch(incrementPinErrorCount());
  };

  if (
    lastCountExceededTimestamp &&
    lastCountExceededTimestamp + AUTH_COOLDOWN_TIMEOUT > Date.now()
  ) {
    return (
      <Countdown
        expiresAt={lastCountExceededTimestamp + AUTH_COOLDOWN_TIMEOUT}
      />
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
      errorMessage="Wrong pin code entered!"
    >
      {errorsCount >= 3 && (
        <SDescription>{`Attempts left: ${
          NUMBER_OF_ATTEMPTS - errorsCount
        }`}</SDescription>
      )}
    </PinCodeBiometryWrapper>
  );
};

const SDescription = styled.Text({
  fontSize: 16,
  marginTop: 12,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
});

export default PinCodeWrapper;
