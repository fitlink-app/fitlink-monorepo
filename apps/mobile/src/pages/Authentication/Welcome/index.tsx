import React from 'react';
import {Button, Logo, TeamInvitation, Label} from '@components';
import {useNavigation} from '@react-navigation/native';
import styled, {useTheme} from 'styled-components/native';
import {Background, GradientUnderlay, WelcomeHeader} from './components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ActivityIndicator, Platform} from 'react-native';
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {signInWithApple, signInWithGoogle} from 'redux/auth/authSlice';
import {AppDispatch} from 'redux/store';
import appleAuth from '@invertase/react-native-apple-authentication';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  resetTeamInvitation,
  selectTeamInvitation,
} from 'redux/teamInvitation/teamInvitationSlice';
import {heightLize} from '@utils';

const mail_icon = require('../../../../assets/images/icon/mail.png');
const google_icon = require('../../../../assets/images/icon/google.png');
const apple_icon = require('../../../../assets/images/icon/apple.png');
const metamask_icon = require('../../../../assets/images/icon/metamask.png');
const kujira_icon = require('../../../../assets/images/icon/logo_kujira.png');

const Wrapper = styled.View({flex: 1, alignItems: 'center'});

const InvitationContainer = styled.View({
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginBottom: '20%',
  width: '100%',
});

const InvitationLogoContainer = styled.View({
  position: 'absolute',
  left: 30,
});

const HeaderContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'flex-end',
  width: '70%',
});

const Line = styled.View({
  position: 'relative',
  marginTop: heightLize(2),
  width: 68,
  height: 0,
  top: 18,
  right: -70,
  border: '2px solid #00E9D7',
  transform: 'rotate(90deg)',
});

const ButtonContainer = styled.View({
  width: '75%',
  marginBottom: 20,
});

const SpacedButton = styled(Button)({
  marginBottom: 10,
});

const Center = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

const LoginButtonLabel = styled(Label)({
  textAlign: 'center',
  fontStyle: 'italic',
  marginTop: 30,
  marginBottom: 40,
});

const LoginButtonContainer = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
});

const LoginButton = styled.View({
  width: '50%',
});

export const Welcome = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const dispatch = useDispatch() as AppDispatch;

  const {invitation, isLoading: isLoadingTeamInvitation} =
    useSelector(selectTeamInvitation);

  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isAppleLoading, setAppleLoading] = useState(false);
  const [isMetaMaskLoading, setIsMetaMaskLoading] = useState(false);

  const handleOnSignUpPressed = () => {
    navigation.navigate('SignUp');
  };

  const handleOnLoginPressed = () => {
    navigation.navigate('SignIn');
  };

  const handleOnGooglePressed = async () => {
    try {
      setGoogleLoading(true);

      await GoogleSignin.signOut();
      const {idToken} = await GoogleSignin.signIn();
      if (idToken) {
        await dispatch(signInWithGoogle(idToken));
      }
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

  const handleOnMetaMaskPressed = async () => {
    try {
      setIsMetaMaskLoading(true);
      setIsMetaMaskLoading(false);
    } catch (e) {
      setIsMetaMaskLoading(false);
    }
  };

  return (
    <Wrapper style={{paddingBottom: insets.bottom}}>
      <GradientUnderlay />

      {isLoadingTeamInvitation ? (
        <Center>
          <ActivityIndicator color={colors.accent} />
        </Center>
      ) : (
        <>
          {invitation ? (
            <InvitationContainer>
              <InvitationLogoContainer
                style={{
                  top: insets.top + 40,
                }}>
                <Logo />
              </InvitationLogoContainer>
              <TeamInvitation
                teamName={invitation.name}
                avatar={invitation.avatar?.url_512x512}
              />
            </InvitationContainer>
          ) : (
            <HeaderContainer>
              <Logo size={'large'} />
              <WelcomeHeader>
                Join a global health and fitness club by connecting the activity
                trackers you are already using
              </WelcomeHeader>
              <Line />
            </HeaderContainer>
          )}

          <ButtonContainer>
            <SpacedButton
              text={'Sign up with your e-mail'}
              textStyle={{marginLeft: 10}}
              logo={mail_icon}
              onPress={handleOnSignUpPressed}
            />
            {Platform.OS === 'ios' ? (
              <SpacedButton
                disabled={isGoogleLoading}
                loading={isGoogleLoading}
                text={'Continue with Google'}
                textStyle={{marginLeft: 10}}
                logo={google_icon}
                onPress={handleOnGooglePressed}
              />
            ) : null}
            {/* <SpacedButton
              disabled={isAppleLoading}
              loading={isAppleLoading}
              text={'Continue with Apple ID'}
              textStyle={{marginLeft: 10}}
              logo={apple_icon}
              onPress={handleOnApplePressed}
            /> */}
            {/*<SpacedButton*/}
            {/*  disabled={isMetaMaskLoading}*/}
            {/*  loading={isMetaMaskLoading}*/}
            {/*  text={'Continue with MetaMask'}*/}
            {/*  textStyle={{marginLeft: 10}}*/}
            {/*  logo={metamask_icon}*/}
            {/*  onPress={handleOnMetaMaskPressed}*/}
            {/*/>*/}
            <SpacedButton
              disabled={true}
              loading={isMetaMaskLoading}
              text={'Continue with Kujira (coming soon)'}
              textStyle={{marginLeft: 10}}
              logo={kujira_icon}
              onPress={handleOnMetaMaskPressed}
            />
            <LoginButtonLabel type={'body'}>
              Do you have an account?
            </LoginButtonLabel>
            <LoginButtonContainer>
              <LoginButton>
                <SpacedButton
                  text={'LOGIN'}
                  type={'accent'}
                  onPress={handleOnLoginPressed}
                />
              </LoginButton>
            </LoginButtonContainer>
          </ButtonContainer>
        </>
      )}

      <Background isInvitationalBackground={!!invitation} />
    </Wrapper>
  );
};
