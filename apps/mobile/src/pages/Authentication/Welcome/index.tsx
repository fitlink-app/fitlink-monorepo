import React from 'react';
import {Button} from '@components';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import {Background, GradientUnderlay, WelcomeHeader} from './components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Platform} from 'react-native';
import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {signInWithApple, signInWithGoogle} from 'redux/auth/authSlice';
import {AppDispatch} from 'redux/store';
import appleAuth from '@invertase/react-native-apple-authentication';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

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
  const dispatch = useDispatch() as AppDispatch;

  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isAppleLoading, setAppleLoading] = useState(false);

  const handleOnSignUpPressed = () => {
    navigation.navigate('SignUp');
  };

  const handleOnLoginPressed = () => {
    navigation.navigate('SignIn');
  };

  const handleOnGooglePressed = async () => {
    try {
      setGoogleLoading(true);

      const {idToken} = await GoogleSignin.signIn();
      if (idToken) await dispatch(signInWithGoogle(idToken));
    } catch (e) {
      setGoogleLoading(false);
    }
  };

  const handleOnApplePressed = async () => {
    try {
      setAppleLoading(true);

      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      await dispatch(signInWithApple(appleAuthRequestResponse));
    } catch (e) {
      setAppleLoading(false);
    }
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
          disabled={isGoogleLoading}
          loading={isGoogleLoading}
          text={'Continue with Google'}
          outline
          icon={'google'}
          onPress={handleOnGooglePressed}
        />
        {Platform.OS === 'ios' && appleAuth.isSupported && (
          <SpacedButton
            disabled={isAppleLoading}
            loading={isAppleLoading}
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
