import {Label} from '@components';
import {useNavigation} from '@react-navigation/core';
import React from 'react';
import styled from 'styled-components/native';

const StyledLabel = styled(Label)({
  paddingTop: 10,
  textAlign: 'center',
  alignSelf: 'center',
  maxWidth: 280,
  lineHeight: '20px',
});

export const PrivacyPolicyLabel = () => {
  const navigation = useNavigation();

  const handlePrivacyPolicyPressed = () => {
    navigation.navigate('Webview', {
      url: 'https://fitlinkteams.com/privacy-policy/',
      title: 'Privacy Policy',
    });
  };

  return (
    <StyledLabel type={'caption'} appearance={'accentSecondary'}>
      To learn more about how Fitlink collects, uses, shares and protects your
      personal data, please read Fitlink's{' '}
      <Label
        type={'caption'}
        appearance={'accentSecondary'}
        bold
        onPress={handlePrivacyPolicyPressed}>
        Privacy Policy
      </Label>
      .
    </StyledLabel>
  );
};
