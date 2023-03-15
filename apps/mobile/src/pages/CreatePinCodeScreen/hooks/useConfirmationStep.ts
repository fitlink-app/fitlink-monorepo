import {Dispatch, SetStateAction, useState} from 'react';

import {PIN_LENGTH} from '@constants';
import {KeychainService} from '@model';
import {grantClientSideAccess} from '../../../redux/auth';
import {useAppDispatch} from '../../../redux/store';

type HookProps = {
  confirmingPin: string;
  setPin: Dispatch<SetStateAction<string>>;
  resetToCreation: () => void;
};

export const useConfirmationStep = ({
  setPin,
  confirmingPin,
  resetToCreation,
}: HookProps) => {
  const dispatch = useAppDispatch();

  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onPinChange = (value: string) => {
    setPin(value);
    if (showError) {
      setShowError(false);
    }
    if (value.length === PIN_LENGTH) {
      setTimeout(() => onFinish(value), 10);
    }
  };

  const onFinish = async (value: string) => {
    if (value !== confirmingPin) {
      setShowError(true);
      setPin('');
      setTimeout(() => {
        resetToCreation();
        setShowError(false);
      }, 1000);
      return;
    }

    setShowError(false);
    setIsLoading(true);
    const Keychain = await KeychainService.getInstance();

    try {
      await Keychain.setPassword({
        passcode: value,
        biometryType: Keychain.supportedBiometryType,
      });
      await Keychain.getCredentialsWithBiometry();
    } catch {
      await Keychain.setPassword({passcode: value});
    } finally {
      dispatch(grantClientSideAccess());
      setIsLoading(false);
    }
  };

  return {
    onPinChange,
    isLoading,
    showError,
  };
};
