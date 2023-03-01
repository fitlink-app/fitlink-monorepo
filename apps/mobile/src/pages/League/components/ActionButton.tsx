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
};

export const ActionButton = ({
  isMember,
  isCteLeague,
  handleOnJoinPressed,
  handleClaimBfitPressed,
  bfitValue,
  isClaimed,
  isClaiming,
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
