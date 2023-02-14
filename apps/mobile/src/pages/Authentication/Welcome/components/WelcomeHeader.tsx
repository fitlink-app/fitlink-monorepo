import React from 'react';
import {Label} from '@components';
import {TextProps} from 'react-native';
import styled from 'styled-components/native';

const BannerLabel = styled(Label)({
  textAlign: 'right',
  fontFamily: 'Roboto',
  fontWeight: 500,
  fontSize: 19,
  lineHeight: 27,
});

export const WelcomeHeader: React.FC<TextProps> = ({children, ...rest}) => (
  <BannerLabel type={'subheading'} {...rest}>
    {children}
  </BannerLabel>
);
