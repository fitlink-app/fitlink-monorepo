import React from 'react';
import {Button} from '@components';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import {Background, GradientUnderlay, WelcomeHeader} from './components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from '@hooks';
import {Platform} from 'react-native';

const Wrapper = styled.View({flex: 1, alignItems: 'center'});

const HeaderContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'flex-end',
  width: '70%',
});

const ButtonContainer = styled.View({
  justifyContent: 'flex-end',
  width: '65%',
  marginBottom: 20,
});

const SpacedButton = styled(Button)({
  marginBottom: 10,
});

export const Welcome = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {signInWithGoogle, signInWithApple, isAppleSignInSupported} = useAuth();

  const handleOnSignUpPressed = () => {
    navigation.navigate('SignUp');
  };

  const handleOnLoginPressed = () => {
    navigation.navigate('SignIn');
  };

  const handleOnGooglePressed = () => {
    signInWithGoogle();
  };

  const handleOnApplePressed = () => {
    signInWithApple();
  };

  return (
    <Wrapper style={{paddingBottom: insets.bottom}}>
      <GradientUnderlay />

      <HeaderContainer>
        <WelcomeHeader>
          Join a global health and fitness club by connecting the activity
          trackers you are already using
        </WelcomeHeader>
      </HeaderContainer>

      <ButtonContainer>
        <SpacedButton text={'Sign up'} onPress={handleOnSignUpPressed} />
        <SpacedButton
          text={'Continue with Google'}
          outline
          icon={'google'}
          onPress={handleOnGooglePressed}
        />
        {Platform.OS === 'ios' && isAppleSignInSupported && (
          <SpacedButton
            text={'Continue with Apple'}
            outline
            icon={'apple'}
            onPress={handleOnApplePressed}
          />
        )}
        <SpacedButton text={'Log in'} textOnly onPress={handleOnLoginPressed} />
      </ButtonContainer>

      <Background />
    </Wrapper>
  );
};
