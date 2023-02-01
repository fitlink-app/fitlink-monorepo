import React, {FC} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {WalletTransaction} from '@fitlink/api/src/modules/wallet-transactions/entities/wallet-transaction.entity';
import {getViewBfitValue} from '@utils';

import theme from '../../../theme/themes/fitlink';
import {
  formatDate,
  getTransactionDescription,
  getTransactionType,
  mapTypeToTitle,
} from '../utils';

const DividerLine = styled.View({
  width: '100%',
  height: 1,
  backgroundColor: 'rgba(255, 255, 255, .08)',
});

const SCardWrapper = styled(View)({
  borderRadius: 17,
  backgroundColor: theme.colors.card,
});

const SOuterCircle = styled(View)({
  zIndex: 1,
  position: 'absolute',
  top: 17,
  left: 24,
  width: 49,
  height: 49,
  borderRadius: 49,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.accent,
});

const SInnerCircle = styled(View)({
  width: 36,
  height: 36,
  borderRadius: 36,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#00CEBE',
});

const SCircleTest = styled.Text({
  fontSize: 22,
  fontWeight: 700,
  fontFamily: 'Roboto',
});

const STopRow = styled(View)({
  marginLeft: 64,
  marginBottom: 20,
  paddingTop: 24,
  paddingHorizontal: 24,
});

const SBottomText = styled.Text({
  marginTop: 24,
  color: '#ACACAC',
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 20,
  fontWeight: 400,
  paddingBottom: 24,
  paddingHorizontal: 24,
});

const STitle = styled.Text({
  color: theme.colors.text,
  fontFamily: 'Roboto',
  fontSize: 16,
  lineHeight: 20,
  fontWeight: 500,
  marginBottom: 4,
});

const SDate = styled.Text({
  color: 'rgba(255, 255, 255, 0.55)',
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  fontWeight: 400,
});

export const WalletHistoryCard: FC<WalletTransaction> = transaction => {
  const type = getTransactionType(transaction);

  if (!type) {
    console.warn('Unsupported transaction type');
    return null;
  }

  const bfitViewValue = getViewBfitValue(transaction.bfit_amount);
  const title = mapTypeToTitle(type, bfitViewValue);
  const formattedDate = formatDate(new Date(transaction.created_at));
  const description = getTransactionDescription(type, {
    bfitViewValue,
    issueName:
      type === 'claim' ? transaction.league_name! : transaction.reward_name!,
  });

  return (
    <View>
      <SOuterCircle>
        <SInnerCircle>
          <SCircleTest>B</SCircleTest>
        </SInnerCircle>
      </SOuterCircle>
      <SCardWrapper>
        <STopRow>
          <STitle>{title}</STitle>
          <SDate>{formattedDate}</SDate>
        </STopRow>
        <DividerLine />
        <SBottomText>{description}</SBottomText>
      </SCardWrapper>
    </View>
  );
};

export default WalletHistoryCard;
