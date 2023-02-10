import {FitButton} from '@components';
import React from 'react';

type ActionButtonProps = {
  isMember: boolean;
  isCteLeague: boolean;
  handleOnJoinPressed: () => void;
  handleClaimBfitPressed?: () => void;
  bfitValue?: number;
};

export const ActionButton = ({
  isMember,
  isCteLeague,
  handleOnJoinPressed,
  handleClaimBfitPressed,
  bfitValue,
}: ActionButtonProps): JSX.Element | null => {
  if (isMember && !isCteLeague) {
    return null;
  }
  if (!isMember) {
    return (
      <FitButton
        onPress={handleOnJoinPressed}
        text={'JOIN LEAGUE'}
        variant="primary-outlined"
      />
    );
  }
  return (
    <FitButton
      onPress={handleClaimBfitPressed}
      text={`CLAIM ${bfitValue} BFIT`}
      variant="primary-outlined"
    />
  );
};
