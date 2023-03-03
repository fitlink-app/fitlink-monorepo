import React, {FC} from 'react';
import styled from 'styled-components/native';

import {ProgressCircle} from '@components';

import theme from '../../../theme/themes/fitlink';

interface AvailableBfitProgressCircleProps {
  availableCurrencyPercentage: number;
  distributedDaily: number;
  distributedToday: number;
  size: number;
}

export const AvailableBfitProgressCircle: FC<AvailableBfitProgressCircleProps> =
  ({availableCurrencyPercentage, distributedDaily, distributedToday, size}) => {
    return (
      <ProgressCircle
        size={size}
        strokeWidth={2}
        bloomRadius={8}
        bloomIntensity={0.5}
        backgroundStrokeWidth={1}
        backgroundStrokeColor="#fff"
        progress={availableCurrencyPercentage}
      >
        <STitle>BFIT</STitle>
        <SBigText>{distributedToday}</SBigText>
        <SSmallText>{distributedDaily}</SSmallText>
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
