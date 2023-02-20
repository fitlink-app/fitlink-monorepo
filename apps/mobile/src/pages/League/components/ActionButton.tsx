import React from 'react';

import {BfitButton} from '@components';

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
      <BfitButton
        onPress={handleOnJoinPressed}
        text={'JOIN LEAGUE'}
        variant="primary-outlined"
      />
    );
  }
  return (
    <BfitButton
      onPress={handleClaimBfitPressed}
      text={`CLAIM ${bfitValue} BFIT`}
      variant="primary-outlined"
    />
  );
};
