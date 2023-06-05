import React from 'react';

import {BfitButton} from '@components';

type ActionButtonProps = {
  isMember: boolean;
  isCteLeague: boolean;
  handleOnJoinPressed: () => void;
  handleClaimBfitPressed?: () => Promise<void>;
  bfitValue?: number;
  isClaiming?: boolean;
  isJoining?: boolean;
  isLoadingOnWaitList?: boolean;
  bfitTotal?: number;
  isExpired: boolean;
};

// TODO: rework so that it doesn't accept boolean props. it should work more like a state machine
export const ActionButton = ({
  isMember,
  isCteLeague,
  handleOnJoinPressed,
  handleClaimBfitPressed,
  bfitValue,
  isClaiming,
  isJoining,
  isLoadingOnWaitList,
  bfitTotal,
  isExpired,
}: ActionButtonProps): JSX.Element | null => {
  if (isMember && !isCteLeague) {
    return null;
  }

  if (!isMember && isLoadingOnWaitList) {
    return <BfitButton disabled isLoading text="" variant="primary-outlined" />;
  }

  if (!isMember) {
    return (
      <BfitButton
        isLoading={isJoining}
        onPress={handleOnJoinPressed}
        disabled={isJoining}
        text="JOIN LEAGUE"
        variant="primary-outlined"
      />
    );
  }

  if (bfitTotal !== undefined && !isExpired && bfitValue == 0 ) {
    return (
      <BfitButton 
        disabled 
        text={`~${bfitTotal} BFIT`} 
        variant={'secondary'} 
      />
    );
  }

  if (bfitValue !== undefined && bfitValue > 0) {
    const displayValue = bfitValue / 1000000;
    return (
      <BfitButton
        disabled={isClaiming}
        onPress={handleClaimBfitPressed}
        isLoading={isClaiming}
        text={isClaiming ? 'CLAIMING' : `CLAIM ${displayValue} BFIT`}
        variant={'primary-outlined'}
      />
    );
  }

  return null;
};
