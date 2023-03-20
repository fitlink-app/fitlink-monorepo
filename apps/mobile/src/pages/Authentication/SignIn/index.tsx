import {Platform, Text} from 'react-native';
import React, {useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {widthLize} from '@utils';
import {Button, KeyboardAvoidingView, Navbar, NAVBAR_HEIGHT} from '@components';

import {SignInForm} from './components';
import {Background} from '../Welcome/components';
import {GradientUnderlay} from '../Welcome/components';

const Wrapper = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flex: 1,
    paddingBottom: 30,
  },
  keyboardShouldPersistTaps: 'handled',
  scrollEnabled: false,
}))({});

const ContentContainer = styled(SafeAreaView)({flex: 1});

const FormContainer = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: widthLize(54),
  width: '100%',
});

const ForgotPasswordButton = styled(Button).attrs(({theme: {colors}}) => ({
  textStyle: {color: colors.accentSecondary},
  textOnly: true,
}))({
  marginTop: 10,
});

export const SignIn = () => {
  const navigation = useNavigation();

  /** Store the email field value from the form to pass it to "ForgotPassword" screen (prefill)*/
  const email = useRef<string>('');

  const handleOnForgotPress = () => {
    navigation.navigate('ForgotPassword', {email: email.current});
  };

  const handleOnRegisterPress = () => {
    navigation.navigate('SignUp');
  };

  return (
    <Wrapper>
      <GradientUnderlay />
      <Navbar
        centerComponent={
          <Text
            style={{
              alignSelf: 'center',
              color: '#00E9D7',
              fontSize: 15,
              fontWeight: '500',
            }}
          >
            SIGN IN
          </Text>
        }
      />
      <ContentContainer>
        <KeyboardAvoidingView
          keyboardVerticalOffset={NAVBAR_HEIGHT}
          enabled={Platform.OS === 'ios'}
        >
          <FormContainer>
            <SignInForm onEmailChanged={text => (email.current = text)} />
            <ForgotPasswordButton
              text={'Forgot password'}
              onPress={handleOnForgotPress}
            />
          </FormContainer>
        </KeyboardAvoidingView>
        <Button
          text={'Register a new account'}
          textOnly
          onPress={handleOnRegisterPress}
        />
      </ContentContainer>

      {/* <Background /> */}
      <Background />
    </Wrapper>
  );
};
