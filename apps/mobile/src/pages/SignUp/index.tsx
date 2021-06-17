import React from 'react';
import {
  Button,
  Logo,
  Navbar,
  KeyboardAvoidingView,
  NAVBAR_HEIGHT,
} from '@components';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SignUpForm, Background} from './components';

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

export const SignUp = () => {
  const navigation = useNavigation();

  const handleOnAlreadyHaveAccountPress = () => {
    navigation.navigate('SignIn');
  };

  return (
    <Wrapper>
      <Navbar centerComponent={<Logo />} />
      <ContentContainer>
        <KeyboardAvoidingView keyboardVerticalOffset={NAVBAR_HEIGHT}>
          <FormContainer>
            <SignUpForm />
          </FormContainer>
        </KeyboardAvoidingView>
        <Button
          text={'Already have an account'}
          textOnly
          onPress={handleOnAlreadyHaveAccountPress}
        />
      </ContentContainer>
      <Background />
    </Wrapper>
  );
};
