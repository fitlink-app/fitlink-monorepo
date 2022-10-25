import React from 'react';
import {Label} from '@components';
import {TextProps} from 'react-native';
import styled from 'styled-components/native';

const Wrapper = styled.View({
  alignItems: 'flex-end',
  width: 321,
  top: 60,
  right: -10,
});

const BannerLabel = styled(Label)({
  display: 'flex',
  alignItems: 'center',
  textAlign: 'right',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: 19,
  lineHeight: 27,
});

export const WelcomeHeader: React.FC<TextProps> = ({children, ...rest}) => (
  <Wrapper>
    <BannerLabel type={'subheading'} {...rest}>
      {children}
    </BannerLabel>
  </Wrapper>
);
