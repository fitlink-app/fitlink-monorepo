import {Button, Icon, Label, TouchHandler} from '@components';
import {useJoinLeague} from '@hooks';
import {useNavigation} from '@react-navigation/native';
import {useLeaveLeague} from 'hooks/api/leagues/useLeaveLeague';
import React from 'react';
import {Animated, Image, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';

const Wrapper = styled(Animated.View)({
  width: '100%',
  justifyContent: 'flex-start',
  position: 'absolute',
});

// TODO: Gradient overlay above image
const HeaderImage = styled(Image)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: 26,
  overflow: 'hidden'
});

const ContentHeader = styled.View({
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
  height: 69,
  paddingTop: 31,
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
});

const HeaderTitle = styled(Text)({
  color: '#FFFFFF',
  fontSize: 17,
  lineHeight: 20,
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: 1,
});

const HeaderContent = styled.View({
  padding: 20,
  justifyContent: 'flex-end',
  height: 231,
});

const ContentRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'flex-end',
});

interface HeaderProps {
  membership: 'none' | 'member' | 'owner';
  height: number;
  leagueId: string;
  headerImage: string;
  scrollAnimatedValue: Animated.Value;
  onEditPressed: () => void;
}

export const Header = ({
  height,
  leagueId,
  headerImage,
  onEditPressed,
  membership = 'none',
  scrollAnimatedValue,
}: HeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {mutateAsync: joinLeague, isLoading: isJoining} = useJoinLeague();
  const {mutateAsync: leaveLeague, isLoading: isLeaving} = useLeaveLeague();

  const handleOnInvitePressed = () => {
    navigation.navigate('LeagueInviteFriends', {leagueId});
  };

  const handleOnJoinPressed = () => {
    joinLeague(leagueId);
  };

  const handleOnLeavePressed = () => {
    leaveLeague(leagueId);
  };

  const handleOnEditPressed = () => {
    onEditPressed();
  };

  const renderLeftButton = () => {
    switch (membership) {
      case 'none':
        return (
          <Button
            wrapContent
            loading={isJoining}
            disabled={isJoining}
            type={'accent'}
            containerStyle={{
              height: 40,
              paddingHorizontal: 0,
            }}
            textStyle={{
              textTransform: 'uppercase',
              fontFamily: 'Roboto',
              fontSize: 14,
              lineHeight: 16,
              fontWeight: '700'
            }}
            text={'Join League'}
            onPress={handleOnJoinPressed}
          />
        );

      case 'member':
        return (
          <Button
            wrapContent
            loading={isLeaving}
            disabled={isLeaving}
            containerStyle={{
              height: 40,
              paddingHorizontal: 0,
            }}
            textStyle={{
              textTransform: 'uppercase',
              fontFamily: 'Roboto',
              fontSize: 14,
              lineHeight: 16,
              fontWeight: '700'
            }}
            text={'Leave League'}
            onPress={handleOnLeavePressed}
          />
        );

      case 'owner':
        return (
          <Button
            wrapContent
            outline
            containerStyle={{
              height: 40,
              paddingHorizontal: 0,
            }}
            textStyle={{
              textTransform: 'uppercase',
              fontFamily: 'Roboto',
              fontSize: 14,
              lineHeight: 16,
              fontWeight: '700'
            }}
            text={'Edit League'}
            onPress={handleOnEditPressed}
          />
        );

      default:
        return null;
    }
  };

  const wrapperPosition = {
    transform: [
      {
        translateY: scrollAnimatedValue.interpolate({
          inputRange: [-250, 0],
          outputRange: [0, -250],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  return (
    <Wrapper style={{...wrapperPosition, height, marginTop: 66}}>
      <HeaderImage
        source={require('../../../../assets/images/leagues/trail-running.png')}
      />
      <ContentHeader>
        <BlurView
          style={{
            position: "absolute",
            width: '100%',
            height: 69,
            backgroundColor: 'rgba(0,0,0,0.2)'
          }}
          blurRadius={1}
          overlayColor={'transparent'}
        />
        <HeaderTitle>
          Gold League
        </HeaderTitle>
      </ContentHeader>
      <HeaderContent>
        <ContentRow>
          {renderLeftButton()}
        </ContentRow>
      </HeaderContent>
    </Wrapper>
  );
};
