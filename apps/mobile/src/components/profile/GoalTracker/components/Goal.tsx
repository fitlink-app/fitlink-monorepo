import React, {useState} from 'react';
import {ViewProps} from 'react-native';
import styled, {useTheme} from 'styled-components/native';

import {LayoutUtils} from '@utils';
import {Icon, Label, ProgressCircle} from '@components';

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

  const getTextForLabel = (goal: Goal) => {
    if (icon === 'sleep') {
      return (
        Math.trunc(goal.value).toString() +
        goal.measure +
        ' ' +
        Math.round((goal.value % 1).toFixed(2) * 60).toString() +
        'M'
      );
    } else {
      return goal.value.toString() + goal.measure;
    }
  };

  const Content = () => {
    return isTapped ? (
      <Label numberOfLines={1} style={{fontSize: 12}}>
        {getTextForLabel(goal)}
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
        size={LayoutUtils.getPercentageSize(16)}
      >
        <Content />
      </ProgressCircle>
    </Wrapper>
  );
};
