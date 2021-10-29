import {Label, Logo} from '@components';
import React from 'react';
import {TextProps} from 'react-native';
import styled from 'styled-components/native';

const Wrapper = styled.View({
  alignItems: 'flex-end',
  width: 180,
  top: 70,
  right: -10,
});

const BannerLabel = styled(Label)({
  textAlign: 'right',
  marginTop: 20,
});

export const WelcomeHeader: React.FC<TextProps> = ({children, ...rest}) => (
  <Wrapper>
    <Logo size={'large'} />
    <BannerLabel type={'subheading'} {...rest}>
      {children}
    </BannerLabel>
  </Wrapper>
);
