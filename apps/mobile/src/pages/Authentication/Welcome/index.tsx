import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Platform, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {Button, Logo, TeamInvitation, Label, BfitSpinner} from '@components';
import appleAuth from '@invertase/react-native-apple-authentication';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import {AppDispatch} from 'redux/store';
import {signInWithApple, signInWithGoogle} from 'redux/auth';
import {Background, GradientUnderlay, WelcomeHeader} from './components';
import {selectTeamInvitation} from 'redux/teamInvitation/teamInvitationSlice';
import theme from '../../../theme/themes/fitlink';
import useMeasureInitialLayout from '../../../hooks/useMeasureInitialLayout';
import analytics from '@react-native-firebase/analytics';

const mail_icon = require('../../../../assets/images/icon/mail.png');
const google_icon = require('../../../../assets/images/icon/google.png');
const apple_icon = require('../../../../assets/images/icon/apple.png');

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
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  width: '75%',
  marginBottom: 60,
});

const Line = styled.View({
  width: 5,
  position: 'absolute',
  backgroundColor: theme.colors.accent,
  right: -20,
  bottom: 0,
});

const ButtonContainer = styled.View({
  width: '75%',
  marginBottom: 20,
});

const SpacedButton = styled(Button)({
  marginBottom: 10,
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
  const dispatch = useDispatch() as AppDispatch;

  const {invitation, isLoading: isLoadingTeamInvitation} =
    useSelector(selectTeamInvitation);

  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isAppleLoading, setAppleLoading] = useState(false);

  const {
    initialLayout: headerLayout,
    measureInitialLayout: measureHeaderLayout,
  } = useMeasureInitialLayout();

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
        await dispatch(signInWithGoogle(idToken)).unwrap();
      }
    } catch (e) {
      console.error('handleOnGooglePressed', e);
      setGoogleLoading(false);
    }
  };

  const handleOnApplePressed = async () => {
    try {
      setAppleLoading(true);

      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // Note: it appears putting FULL_NAME first is important, see issue #293
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      await dispatch(signInWithApple(appleAuthRequestResponse));
    } catch (e) {
      console.error('handleOnApplePressed', e);
      setAppleLoading(false);
    }
  };

  return (
    <Wrapper style={{paddingBottom: insets.bottom}}>
      <GradientUnderlay />

      {isLoadingTeamInvitation ? (
        <BfitSpinner wrapperStyle={styles.loadingWrapper} />
      ) : (
        <>
          {invitation ? (
            <InvitationContainer>
              <InvitationLogoContainer
                style={{
                  top: insets.top + 40,
                }}
              >
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
              <WelcomeHeader onLayout={measureHeaderLayout}>
                Join a global health and fitness club by connecting the activity
                trackers you are already using
              </WelcomeHeader>
              <Line
                style={{
                  height: headerLayout.height - 8, // 27 (line height) - 19 (font size)
                  bottom: 4, // 8 / 2
                }}
              />
            </HeaderContainer>
          )}

          <ButtonContainer>
            <SpacedButton
              text={'Sign up with your e-mail'}
              textStyle={{marginLeft: 10}}
              logo={mail_icon}
              onPress={handleOnSignUpPressed}
            />
            <LoginButtonLabel type={'body'}>
              Do you have an account?
            </LoginButtonLabel>
            <LoginButtonContainer>
              <LoginButton>
                <SpacedButton
                  text={'LOGIN'}
                  type={'accent'}
                  onPress={async () => {
                    try {
                      await analytics().logEvent(
                        'league_invite_deeplink_pressed',
                        {
                          league_id: '3745092',
                          inviter_user_id: '3745092',
                          newcomer_user_id: '3745092',
                        },
                      );
                    } catch (e) {
                      console.log(e);
                    }
                  }}
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

// TODO: use when back supports CLIENT_ID
/*
{Platform.OS === 'ios' && (
  <>
    <SpacedButton
      disabled={isGoogleLoading}
      loading={isGoogleLoading}
      text={'Continue with Google'}
      textStyle={{marginLeft: 10}}
      logo={google_icon}
      onPress={handleOnGooglePressed}
    />
    <SpacedButton
      disabled={isAppleLoading}
      loading={isAppleLoading}
      text={'Continue with Apple ID'}
      textStyle={{marginLeft: 10}}
      logo={apple_icon}
      onPress={handleOnApplePressed}
    />
  </>
)}
 */

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
