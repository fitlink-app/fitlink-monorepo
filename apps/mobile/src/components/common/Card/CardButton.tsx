import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Icon} from '../Icon';
import {TouchHandler, TouchHandlerProps} from '../TouchHandler';

interface CardButtonProps extends TouchHandlerProps {
  text: string;
}

export const CardButton = ({text, ...rest}: CardButtonProps) => {
  const Label = styled.Text(({theme}) => ({
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.secondaryText,
  }));

  const Row = styled.View({
    flexDirection: 'row',
    alignItems: 'center',
  });

  const {colors} = useTheme();

  return (
    <TouchHandler {...rest}>
      <Row>
        <Label>{text}</Label>

        <Icon
          style={{
            transform: [{rotate: '180deg'}],
            marginLeft: 8,
            marginTop: 2,
          }}
          name={'arrow-left'}
          size={8}
          color={colors.secondaryText}
        />
      </Row>
    </TouchHandler>
  );
};
