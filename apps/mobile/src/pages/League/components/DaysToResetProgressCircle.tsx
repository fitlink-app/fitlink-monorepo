import React from 'react';

import styled from 'styled-components/native';

import {ProgressCircle} from '@components';

import theme from '../../../theme/themes/fitlink';

interface DaysToResetProgressCircleProps {
  daysPercentage: number;
  counbackString: string;
  label: string;
  size: number;
}

export const DaysToResetProgressCircle = ({
  daysPercentage,
  counbackString,
  label,
  size,
}: DaysToResetProgressCircleProps) => (
  <ProgressCircle
    size={size}
    backgroundStrokeWidth={3}
    strokeWidth={3}
    progress={daysPercentage}
    backgroundColor="#171717"
  >
    <STitle>{label}</STitle>
    <SBigText>{counbackString}</SBigText>
  </ProgressCircle>
);

const STitle = styled.Text({
  fontSize: 12,
  lineHeight: 14,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
});

const SBigText = styled.Text({
  fontSize: 20,
  lineHeight: 24,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.accent,
});
