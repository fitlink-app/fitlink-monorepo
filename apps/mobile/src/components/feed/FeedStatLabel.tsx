import styled from 'styled-components/native';
import React from 'react';
import {Label} from '../common/Label';

const StatLabelContainer = styled.View({
  flexDirection: 'row',
});

const LabeledCounter = ({label, value}: {label: string; value: string}) => (
  <StatLabelContainer>
    <Label type="caption" appearance="primary">
      {label}{' '}
    </Label>
    <Label type="caption" appearance="accent">
      {value}
    </Label>
  </StatLabelContainer>
);

interface FeedStatLabelProps {
  label: string;
  value: string;
}

export const FeedStatLabel = ({label, value}: FeedStatLabelProps) => {
  return <LabeledCounter label={label} value={value} />;
};
