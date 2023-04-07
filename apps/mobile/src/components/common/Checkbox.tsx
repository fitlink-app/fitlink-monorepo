import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Icon} from './Icon';
import {Label} from './Label';
import {TouchHandler} from './TouchHandler';

const Wrapper = styled.View({
  flexDirection: 'row',
});

const Box = styled.View(({theme: {colors}}) => ({
  borderRadius: 4,
  borderWidth: 2,
  width: 20,
  height: 20,
  alignItems: 'center',
  justifyContent: 'center',
}));

interface CheckboxProps {
  onPress: () => void;
  checked: boolean;
  text?: string;
}

export const Checkbox = (props: CheckboxProps) => {
  const {onPress, checked, text} = props;

  const {colors} = useTheme();

  return (
    <TouchHandler {...{onPress}}>
      <Wrapper>
        <Box
          style={{
            borderColor: checked ? colors.accent : colors.accentSecondary,
            backgroundColor: checked ? colors.accent : undefined,
          }}
        >
          {checked && (
            <Icon name={'check'} color={colors.chartUnfilled} size={12} />
          )}
        </Box>
        {text && (
          <Label style={{marginLeft: 8}} appearance={'primary'}>
            {text}
          </Label>
        )}
      </Wrapper>
    </TouchHandler>
  );
};
