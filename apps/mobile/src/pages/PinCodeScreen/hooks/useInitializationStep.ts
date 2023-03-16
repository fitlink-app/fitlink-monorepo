import {Dispatch, SetStateAction} from 'react';

import {PIN_LENGTH} from '@constants';

type HookProps = {
  setPin: Dispatch<SetStateAction<string>>;
  setConfirmingPin: Dispatch<SetStateAction<string>>;
  setIsConfirmationStep: Dispatch<SetStateAction<boolean>>;
};

export const useInitializationStep = ({
  setPin,
  setConfirmingPin,
  setIsConfirmationStep,
}: HookProps) => {
  const onPinChange = (value: string) => {
    setPin(value);
    if (value.length === PIN_LENGTH) {
      setTimeout(() => onFinish(value), 10);
    }
  };

  const onFinish = (value: string) => {
    setConfirmingPin(value);
    setPin('');
    setIsConfirmationStep(true);
  };

  return {onPinChange};
};
