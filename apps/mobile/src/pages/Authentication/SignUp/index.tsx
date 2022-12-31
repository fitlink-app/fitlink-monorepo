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
import {SignUpForm} from './components';
import {Platform, Text} from 'react-native';
import {Background} from '../Welcome/components/Background';
import {GradientUnderlay} from '../Welcome/components';
import {widthLize} from '@utils';

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

export const SignUp = () => {
  const navigation = useNavigation();

  const handleOnAlreadyHaveAccountPress = () => {
    navigation.navigate('SignIn');
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
            }}>
            SIGN UP
          </Text>
        }
      />
      <ContentContainer>
        <KeyboardAvoidingView
          keyboardVerticalOffset={NAVBAR_HEIGHT}
          enabled={Platform.OS === 'ios'}>
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
