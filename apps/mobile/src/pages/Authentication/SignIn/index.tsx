import React, {useRef} from 'react';
import {
  Button,
  KeyboardAvoidingView,
  Logo,
  Navbar,
  NAVBAR_HEIGHT,
} from '@components';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SignInForm, Background} from './components';

const Wrapper = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flex: 1,
    marginBottom: 30,
  },
  keyboardShouldPersistTaps: 'handled',
  scrollEnabled: false,
}))({});

const ContentContainer = styled(SafeAreaView)({flex: 1});

const FormContainer = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
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
      <Navbar centerComponent={<Logo />} />
      <ContentContainer>
        <KeyboardAvoidingView keyboardVerticalOffset={NAVBAR_HEIGHT}>
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

      <Background />
    </Wrapper>
  );
};
