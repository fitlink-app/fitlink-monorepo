import React from 'react';
import {Button} from '@components';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Background, GradientUnderlay, WelcomeHeader} from './components';

const Wrapper = styled(SafeAreaView)({flex: 1, alignItems: 'center'});

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

  const handleOnSignUpPress = () => {
    navigation.navigate('SignUp');
  };

  const handleOnLoginPress = () => {
    navigation.navigate('SignIn');
  };

  return (
    <Wrapper>
      <GradientUnderlay />

      <HeaderContainer>
        <WelcomeHeader>
          Join a global health and fitness club by connecting the activity
          trackers you are already using
        </WelcomeHeader>
      </HeaderContainer>

      <ButtonContainer>
        <SpacedButton text={'Sign up'} onPress={handleOnSignUpPress} />
        <SpacedButton text={'Continue with Google'} outline icon={'google'} />
        <SpacedButton text={'Continue with Apple'} outline icon={'apple'} />
        <SpacedButton text={'Log in'} textOnly onPress={handleOnLoginPress} />
      </ButtonContainer>

      <Background />
    </Wrapper>
  );
};
