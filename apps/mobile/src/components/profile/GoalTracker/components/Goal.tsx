import React, {useState} from 'react';
import {ViewProps} from 'react-native';
import styled, {useTheme} from 'styled-components/native';

import {LayoutUtils} from '@utils';

import {Icon, Label, ProgressCircle} from '../../../common';

export type Goal = {
  value: number;
  target: number;
  measure: string;
};

interface GoalProps extends ViewProps {
  goal: Goal;
  disabled?: boolean;
  icon: string;
  onPress?: () => void;
}

const Wrapper = styled.TouchableOpacity({alignItems: 'center'});

export const Goal = ({goal, icon, onPress, ...rest}: GoalProps) => {
  const {colors} = useTheme();

  const [isTapped, setIsTapped] = useState(false);

  const progress = goal.value / goal.target;

  const onPressHandler = () => {
    onPress?.();
    setIsTapped(prev => !prev);
  };

  const OnRenderCircle = () => {
    return isTapped ? (
      <Label numberOfLines={1} style={{fontSize: 12, letterSpacing: 2}}>
        {goal.value.toString() + goal.measure}
      </Label>
    ) : (
      <Icon
        name={icon}
        size={LayoutUtils.getPercentageSize(8)}
        color={colors.text}
      />
    );
  };

  return (
    <Wrapper {...rest} onPress={onPressHandler}>
      <ProgressCircle
        {...{progress}}
        strokeWidth={2}
        backgroundStrokeWidth={1}
        bloomIntensity={0.5}
        bloomRadius={8}
        size={LayoutUtils.getPercentageSize(16)}>
        <OnRenderCircle />
      </ProgressCircle>
    </Wrapper>
  );
};
