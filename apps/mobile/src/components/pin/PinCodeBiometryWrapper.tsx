import React, {FC, useEffect, useState, useRef, PropsWithChildren} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {BIOMETRY_TYPE} from 'react-native-keychain';

import {KeychainService} from '@model';
import {PIN_LENGTH} from '@constants';
import {IPinCodeViewProps, PinCodeView} from '@components';

export interface IOnSuccessProps {
  pin: string;
}

export interface IAuthViewProps
  extends Pick<IPinCodeViewProps, 'title' | 'subtitle'> {
  biometryAuthTitle?: string;
  biometryAuthSubtitle?: string;
  biometryAuthCancel?: string;
  biometryAuthDescription?: string;
  forceBiometry?: boolean;
  useBiometry?: boolean;

  onSuccess(props: IOnSuccessProps): void;
  onErrorChange(hasError: boolean): void;
}

export const AuthInput: FC<PropsWithChildren<IAuthViewProps>> = ({
  title,
  subtitle,
  biometryAuthTitle,
  forceBiometry = false,
  useBiometry = false,
  children,

  onSuccess,
  onErrorChange,
}) => {
  const isBiometricAuthInProgressRef = useRef(false);
  const prevAppStateRef = useRef<AppStateStatus>('active');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [biometryType, setBiometryType] = useState<BIOMETRY_TYPE | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    (async () => {
      if (!useBiometry) {
        return;
      }
      const Keychain = await KeychainService.getInstance();

      setBiometryType(Keychain.getBiometryType());

      if (forceBiometry) {
        setTimeout(onBiometryAuth, 50);
      }
    })();
  }, [forceBiometry, useBiometry]);

  useEffect(() => {
    if (!useBiometry) {
      return;
    }

    const appStateChangeHandler = (nextAppState: AppStateStatus) => {
      if (
        nextAppState === 'active' &&
        prevAppStateRef.current === 'background'
      ) {
        prevAppStateRef.current = nextAppState;
        if (forceBiometry) {
          setTimeout(onBiometryAuth, 50);
        }
        return;
      }
      prevAppStateRef.current = nextAppState;
    };

    AppState.addEventListener('change', appStateChangeHandler);
    return () => {
      AppState.removeEventListener('change', appStateChangeHandler);
    };
  }, [forceBiometry, useBiometry]);

  const onBiometryAuth = async () => {
    if (isBiometricAuthInProgressRef.current) {
      return;
    }
    isBiometricAuthInProgressRef.current = true;

    const Keychain = await KeychainService.getInstance();

    try {
      const pin = await Keychain.getCredentialsWithBiometry({
        title: biometryAuthTitle ?? 'Authenticate to open BFIT',
      });

      if (!pin) {
        return;
      }
      onSuccess({pin});
    } finally {
      isBiometricAuthInProgressRef.current = false;
    }
  };

  const onFinish = async (pin: string) => {
    onSuccess({pin});
  };

  const onPinChange = (pin: string) => {
    if (pin.length < PIN_LENGTH) {
      setIsError(false);
      onErrorChange(false);
    }
    setEnteredPin(pin);
    if (pin.length === PIN_LENGTH) {
      setTimeout(() => onFinish(pin), 10);
    }
  };

  return (
    <PinCodeView
      error={isError}
      title={title}
      subtitle={subtitle}
      pin={enteredPin}
      biometryType={biometryType}
      children={children}
      onPinChange={onPinChange}
      onBiometry={onBiometryAuth}
    />
  );
};

export default AuthInput;
