import {Icon, Label, ProgressCircle} from '../../../common';
import React from 'react';
import {ViewProps} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {LayoutUtils, NumberFormatterUtils} from '@utils';

export type Goal = {
  value: number;
  target: number;
};

interface GoalProps {
  goal: Goal;
  disabled?: boolean;
  icon: string;
}

const Wrapper = styled.View({alignItems: 'center'});

const Value = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  marginTop: 5,
});

export const Goal = ({
  disabled,
  goal,
  icon,
  ...rest
}: GoalProps & ViewProps) => {
  const {colors} = useTheme();

  const progress = goal.value / goal.target;

  return (
    <Wrapper {...rest}>
      <ProgressCircle
        {...{progress}}
        strokeWidth={4}
        backgroundStrokeWidth={2}
        bloomIntensity={0.5}
        bloomRadius={8}
        size={LayoutUtils.getPercentageSize(16)}>
        <Icon
          name={icon}
          size={LayoutUtils.getPercentageSize(8)}
          color={disabled ? colors.accentSecondary : colors.accent}
        />
      </ProgressCircle>

      <Value appearance={progress >= 1 ? 'accent' : 'secondary'}>
        {NumberFormatterUtils.toCommaSeparated(goal.value.toString(), 1)}
      </Value>
    </Wrapper>
  );
};
