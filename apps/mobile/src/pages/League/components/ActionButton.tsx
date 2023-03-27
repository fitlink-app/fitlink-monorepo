import React from 'react';

import {BfitButton, Icon} from '@components';
import theme from '../../../theme/themes/fitlink';

type ActionButtonProps = {
  isMember: boolean;
  isCteLeague: boolean;
  handleOnJoinPressed: () => void;
  handleClaimBfitPressed?: () => Promise<void>;
  bfitValue?: number;
  isClaiming?: boolean;
  isClaimed?: boolean;
  isJoining?: boolean;
  isOnWaitList?: boolean;
  isLoadingOnWaitList?: boolean;
};

// TODO: rework so that it doesn't accept boolean props. it should work more like a state machine
export const ActionButton = ({
  isMember,
  isCteLeague,
  handleOnJoinPressed,
  handleClaimBfitPressed,
  bfitValue,
  isClaimed,
  isClaiming,
  isJoining,
  isOnWaitList,
  isLoadingOnWaitList,
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
        disabled={isJoining || isOnWaitList}
        text={isOnWaitList ? 'ON WAITLIST' : 'JOIN LEAGUE'}
        variant={isOnWaitList ? 'secondary' : 'primary-outlined'}
      />
    );
  }

  const stableClaimText = isClaimed ? 'CLAIMED' : `CLAIM ${bfitValue} BFIT`;

  const ClaimedIcon = () => (
    <Icon name={'check'} size={14} color={theme.colors.background} />
  );

  return (
    <BfitButton
      disabled={isClaiming}
      onPress={handleClaimBfitPressed}
      isLoading={isClaiming}
      text={isClaiming ? 'CLAIMING' : stableClaimText}
      variant={isClaimed ? 'primary' : 'primary-outlined'}
      LeadingIcon={isClaimed ? ClaimedIcon : undefined}
    />
  );
};
