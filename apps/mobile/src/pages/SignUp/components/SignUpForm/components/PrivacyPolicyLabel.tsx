import {Label} from '@components';
import {useNavigation} from '@react-navigation/core';
import React from 'react';
import styled from 'styled-components/native';

const StyledLabel = styled(Label)({
  paddingTop: 10,
  textAlign: 'center',
  alignSelf: 'center',
  maxWidth: 280,
  lineHeight: 20,
});

export const PrivacyPolicyLabel = () => {
  const navigation = useNavigation();

  const handleOnTermsOfServicePressed = () => {
    navigation.navigate('TermsOfService');
  };

  return (
    <StyledLabel type={'caption'} appearance={'accentSecondary'}>
      To learn more about how Fitlink collects, uses, shares and protects your
      personal data, please read Fitlink's{' '}
      <Label
        type={'caption'}
        appearance={'accentSecondary'}
        bold
        onPress={handleOnTermsOfServicePressed}>
        Privacy Policy
      </Label>
      .
    </StyledLabel>
  );
};
