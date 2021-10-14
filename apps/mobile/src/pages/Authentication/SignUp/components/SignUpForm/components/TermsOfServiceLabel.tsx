import {Label} from '@components';
import {useNavigation} from '@react-navigation/core';
import React from 'react';
import styled from 'styled-components/native';

const StyledLabel = styled(Label)({
  paddingTop: 5,
  textAlign: 'center',
  alignSelf: 'center',
  maxWidth: 280,
  lineHeight: '20px',
});

export const TermsOfServiceLabel = () => {
  const navigation = useNavigation();

  const handleOnTermsOfServicePressed = () => {
    navigation.navigate('TermsOfService');
  };

  return (
    <StyledLabel appearance={'accentSecondary'}>
      By creating an account, you agree to Fitlink's{' '}
      <Label bold onPress={handleOnTermsOfServicePressed}>
        Terms of Service
      </Label>
      .
    </StyledLabel>
  );
};
