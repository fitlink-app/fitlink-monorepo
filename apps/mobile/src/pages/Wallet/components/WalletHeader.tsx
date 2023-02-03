import React, {FC} from 'react';
import styled from 'styled-components/native';

import {Icon, Label, WeeklyEarningsGraph} from '@components';
import {useWeeklyEarnings} from '@hooks';

import theme from 'theme/themes/fitlink';
import WalletActions from './WalletActions';

interface BalanceProps {
  bfitAmount: number;
  usdAmount: number;
  onInfoPress: () => unknown;
}

const Balance: FC<BalanceProps> = ({bfitAmount, usdAmount, onInfoPress}) => (
  <>
    <SBfitAmount>{Math.trunc(bfitAmount)} BFIT</SBfitAmount>
    <SRow>
      <SSecondaryText>{`$${usdAmount}`}</SSecondaryText>
      <SSelfCentered>
        <Icon
          onPress={onInfoPress}
          color={theme.colors.text}
          size={17}
          name="info"
        />
      </SSelfCentered>
    </SRow>
  </>
);

const SBfitAmount = styled.Text({
  fontFamily: 'Roboto',
  fontSize: 42,
  lineHeight: 48,
  fontWeight: 500,
  color: '#ffffff',
});

interface WalletHeaderProps {
  bfitAmount: number;
  usdAmount: number;
  onInfoPress: () => unknown;
  onBuy: () => void;
  onSell: () => void;
  onStake: () => void;
}

export const WalletHeader = ({
  bfitAmount,
  usdAmount,
  onInfoPress,
  onBuy,
  onSell,
  onStake,
}: WalletHeaderProps) => {
  const {weeklyEarnings} = useWeeklyEarnings();

  return (
    <>
      <SCentered>
        <Balance
          bfitAmount={bfitAmount}
          onInfoPress={onInfoPress}
          usdAmount={usdAmount}
        />
        <WeeklyEarningsGraph
          height={70}
          barWidth={8}
          gapWidth={34}
          weeklyEarnings={weeklyEarnings}
          containerStyle={{marginVertical: 20}}
        />
      </SCentered>
      <WalletActions onBuy={onBuy} onSell={onSell} onStake={onStake} />
      <SListTitle>TRANSACTION HISTORY</SListTitle>
    </>
  );
};

const SCentered = styled.View({
  alignItems: 'center',
});

const SListTitle = styled(Label).attrs(() => ({
  type: 'title',
}))({
  marginTop: 40,
  marginBottom: 17,
});

const SRow = styled.View({
  flexDirection: 'row',
  marginTop: 10,
});

const SSecondaryText = styled(Label).attrs({
  appearance: 'secondary',
})({
  fontSize: 20,
});

const SSelfCentered = styled.View({alignSelf: 'center', marginLeft: 8});

export default WalletHeader;
