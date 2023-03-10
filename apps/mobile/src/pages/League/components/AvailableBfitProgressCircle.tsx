import React, {FC} from 'react';
import styled from 'styled-components/native';

import {ProgressCircle} from '@components';

import theme from '../../../theme/themes/fitlink';

interface AvailableBfitProgressCircleProps {
  availableCurrencyPercentage: number;
  distributedDaily: number;
  distributedToday: number;
  size: number;
  showAltCurrency: boolean;
}

export const AvailableBfitProgressCircle: FC<AvailableBfitProgressCircleProps> =
  ({
    showAltCurrency,
    availableCurrencyPercentage,
    distributedDaily,
    distributedToday,
    size,
  }) => {
    const todayViewValue = showAltCurrency
      ? `$${distributedToday}`
      : distributedToday;
    const dailyViewValue = showAltCurrency
      ? `$${distributedDaily}`
      : distributedDaily;

    return (
      <ProgressCircle
        size={size}
        strokeWidth={2}
        bloomRadius={8}
        bloomIntensity={0.5}
        backgroundStrokeWidth={1}
        progress={availableCurrencyPercentage}
      >
        <STitle>BFIT</STitle>
        <SBigText>{todayViewValue}</SBigText>
        <SSmallText>{dailyViewValue}</SSmallText>
      </ProgressCircle>
    );
  };

const STitle = styled.Text({
  fontSize: 12,
  lineHeight: 14,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
});

const SBigText = styled.Text({
  fontSize: 22,
  lineHeight: 26,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.accent,
});

const SSmallText = styled.Text({
  fontSize: 12,
  lineHeight: 14,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.secondaryText,
});

export default AvailableBfitProgressCircle;
