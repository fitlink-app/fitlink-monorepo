import React, {FC} from 'react';
import styled from 'styled-components/native';

import {Icon, Label, WeeklyEarningsGraph} from '@components';

import PaddedNumber from 'components/common/numbers/PaddedNumber';
import theme from 'theme/themes/fitlink';
import WalletActions from './WalletActions';

interface BalanceProps {
  bfitAmount: number;
  usdAmount: number;
  onInfoPress: () => unknown;
}

const Balance: FC<BalanceProps> = ({bfitAmount, usdAmount, onInfoPress}) => (
  <>
    <PaddedNumber
      amount={bfitAmount}
      totalNumberOfDigits={5}
      trailingString="BFIT"
    />
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

interface WalletHeaderProps {
  bfitAmount: number;
  usdAmount: number;
  onInfoPress: () => unknown;
  onBuy: () => void;
  onSell: () => void;
  onStock: () => void;
}

export const WalletHeader = ({
  bfitAmount,
  usdAmount,
  onInfoPress,
  onBuy,
  onSell,
  onStock,
}: WalletHeaderProps) => (
  <>
    <SCentered>
      <Balance
        bfitAmount={bfitAmount}
        onInfoPress={onInfoPress}
        usdAmount={usdAmount}
      />
      <WeeklyEarningsGraph
        barWidth={8}
        gapWidth={34}
        height={70}
        containerStyle={{marginVertical: 20}}
      />
    </SCentered>
    <WalletActions onBuy={onBuy} onSell={onSell} onStock={onStock} />
    <SListTitle>TRANSACTION HISTORY</SListTitle>
  </>
);

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
