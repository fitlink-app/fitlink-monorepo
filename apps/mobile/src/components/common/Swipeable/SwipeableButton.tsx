import React, {useRef} from 'react';
import {TouchableOpacityProps, ViewStyle, TextStyle} from 'react-native';
import styled from 'styled-components/native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Icon, Label} from '@components';

const ButtonBase = styled(TouchableOpacity)<TouchableOpacityProps>({
  width: 70,
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
});

const Separator = styled.View({
  backgroundColor: 'rgba(0,0,0,.1)',
  height: '100%',
  width: 4,
  position: 'absolute',
  right: 0,
});

interface SwipeableButtonProps {
  /** Name of icon */
  icon: string;

  /** Color of icon */
  iconColor: string;

  /** Text displayed under icon */
  text: string;

  hideSeparator?: boolean;

  /** Called on button press */
  onPress: () => void;

  style?: ViewStyle;

  textStyle?: TextStyle;
}

export const SwipeableButton: React.FC<SwipeableButtonProps> = props => {
  const {icon, iconColor, text, onPress, hideSeparator, style, textStyle} =
    props;

  const isPressable = useRef(true);

  const handlePress = () => {
    if (isPressable.current) {
      isPressable.current = false;

      setTimeout(() => {
        isPressable.current = true;
      }, 250);

      onPress();
    }
  };

  return (
    <ButtonBase {...{style}} onPress={handlePress}>
      <Icon name={icon} color={iconColor} size={20} />

      <Label appearance={'primary'} style={{...textStyle, paddingTop: 5}}>
        {text}
      </Label>

      {!hideSeparator && <Separator />}
    </ButtonBase>
  );
};
