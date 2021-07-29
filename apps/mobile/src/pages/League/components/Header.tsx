import {Button, Icon, Label} from '@components';
import {useJoinLeague} from '@hooks';
import {useNavigation} from '@react-navigation/native';
import {useLeaveLeague} from 'hooks/api/leagues/useLeaveLeague';
import React from 'react';
import {Animated, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';

const Wrapper = styled(Animated.View)({
  width: '100%',
  justifyContent: 'flex-end',
  position: 'absolute',
});

// TODO: Gradient overlay above image
const HeaderImage = styled(Image)({
  width: '100%',
  height: '100%',
  position: 'absolute',
});

const ImageOverlay = styled(LinearGradient).attrs(() => ({
  colors: ['#0000004D', '#00000099'],
}))({
  ...StyleSheet.absoluteFillObject,
  opacity: 0.9,
});

const HeaderContent = styled.View({
  margin: 20,
  justifyContent: 'flex-end',
  height: 130,
});

const ContentRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const LeagueTitle = styled(Label).attrs({
  type: 'title',
  appearance: 'primary',
  numberOfLines: 3,
})({
  flex: 1,
});

const VerticalSpacer = styled.View({height: 10});

const HorizontalSpacer = styled.View({width: 10});

interface HeaderProps {
  membership: 'none' | 'member' | 'owner';
  height: number;
  leagueId: string;
  title: string;
  headerImage: string;
  memberCount: number;
  scrollAnimatedValue: Animated.Value;
  onEditPressed: () => void;
}

export const Header = ({
  height,
  leagueId,
  title,
  memberCount,
  headerImage,
  onEditPressed,
  membership = 'none',
  scrollAnimatedValue,
}: HeaderProps) => {
  const navigation = useNavigation();

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
            containerStyle={{
              height: 36,
              paddingHorizontal: 16,
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
            outline
            containerStyle={{
              height: 36,
              paddingHorizontal: 16,
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
              height: 36,
              paddingHorizontal: 16,
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
    <Wrapper style={{...wrapperPosition, height}}>
      <HeaderImage
        source={{
          uri: headerImage,
        }}
      />
      <ImageOverlay />
      <HeaderContent>
        <ContentRow>
          {renderLeftButton()}

          <HorizontalSpacer />

          {membership !== 'none' && (
            <Icon
              style={{bottom: -10}}
              name={'user-plus'}
              size={24}
              color={'white'}
              onPress={handleOnInvitePressed}
            />
          )}
        </ContentRow>

        <VerticalSpacer />

        <ContentRow>
          <LeagueTitle>{title}</LeagueTitle>

          <HorizontalSpacer />

          <Label>{memberCount} members</Label>
        </ContentRow>
      </HeaderContent>
    </Wrapper>
  );
};
