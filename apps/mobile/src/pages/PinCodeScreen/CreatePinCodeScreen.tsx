import React from 'react';

import PinCodeConfirmationSteps from './components/PinCodeConfirmationSteps';

export const CreatePinCodeScreen = () => {
  return (
    <PinCodeConfirmationSteps
      initStepHeader="Create Pin Code"
      confirmStepHeader="Confirm Pin Code"
    />
  );
};

export default CreatePinCodeScreen;
