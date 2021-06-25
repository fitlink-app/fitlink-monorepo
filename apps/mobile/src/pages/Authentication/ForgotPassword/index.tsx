import React from 'react';
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
import {ForgotPasswordForm} from './components';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from 'routes/types';

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

export const ForgotPassword = ({
  route: {
    params: {email},
  },
}: StackScreenProps<RootStackParamList, 'ForgotPassword'>) => {
  const navigation = useNavigation();

  const handleOnBackToSignInPress = () => {
    navigation.goBack();
  };

  return (
    <Wrapper>
      <Navbar centerComponent={<Logo />} />
      <ContentContainer>
        <KeyboardAvoidingView keyboardVerticalOffset={NAVBAR_HEIGHT}>
          <FormContainer>
            <ForgotPasswordForm {...{email}} />
          </FormContainer>
        </KeyboardAvoidingView>
        <Button
          text={'Back to sign in'}
          textOnly
          onPress={handleOnBackToSignInPress}
        />
      </ContentContainer>
    </Wrapper>
  );
};
