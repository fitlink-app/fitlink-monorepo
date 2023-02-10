import {Label, TouchHandler, TouchHandlerProps} from '@components';
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import styled, {useTheme} from 'styled-components/native';

const Wrapper = styled.View(({theme: {colors}}) => ({
  paddingVertical: 5,
  marginHorizontal: 5,
  alignItems: 'center',
  borderRadius: 10,
}));

interface FilterButtonProps extends TouchHandlerProps {
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  text: string;
}

export const FilterButton = (props: FilterButtonProps & TouchHandlerProps) => {
  const {style, text, selected, ...rest} = props;
  const {colors} = useTheme();

  return (
    <TouchHandler {...rest} style={{flex: 1}}>
      <Wrapper
        style={{
          ...(style as {}),
          justifyContent: 'center',
          backgroundColor: selected ? colors.accent : colors.text,
        }}>
        <Label
          appearance={'black'}
          style={{textAlign: 'center', fontSize: 13}}>
          {text}
        </Label>
      </Wrapper>
    </TouchHandler>
  );
};
