import {TouchHandler, Icon, Label} from '../../../common';
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import styled, {useTheme} from 'styled-components/native';

const CheckButtonWrapper = styled.View({
  paddingVertical: 15,
  flexDirection: 'row',
  justifyContent: 'space-between',
});

export const CheckButton = ({
  onPress,
  label,
  checked,
  disabled,
  style,
}: {
  onPress?: () => void;
  label: string;
  checked: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) => {
  const {colors} = useTheme();
  return (
    <TouchHandler
      {...{onPress, disabled}}
      style={{...(style as {}), width: '100%'}}>
      <CheckButtonWrapper>
        <Label
          type={'subheading'}
          appearance={disabled ? 'accentSecondary' : 'primary'}>
          {label}
        </Label>
        {checked && (
          <Icon
            name={'check'}
            size={18}
            color={disabled ? colors.accentSecondary : colors.accent}
          />
        )}
      </CheckButtonWrapper>
    </TouchHandler>
  );
};
