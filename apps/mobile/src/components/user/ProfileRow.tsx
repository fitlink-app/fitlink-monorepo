import {useFollowUser, useUnfollowUser} from '@hooks';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Avatar, Label, Icon, TouchHandler} from '../common';

/** Styled Components */
const Wrapper = styled.View({
  width: '100%',
  height: 57,
  marginTop: 14
});

const Flex = styled.View({
  flex: 1,
});

const ContentContainer = styled(Flex)({
  marginHorizontal: 20,
});

const Row = styled.View({
  flexDirection: 'row',
});

const ContentRow = styled(Row)({
  flex: 1,
  alignItems: 'flex-start',
});

const AvatarImage = styled.Image({
  width: 57,
  height: 57,
  borderRadius: 16,
});

const UserDetailsContainer = styled(Flex)({
  justifyContent: 'flex-start',
  height: '100%',
  marginLeft: 20,
});

const Name = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'primary',
}))({});

const Team = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
  appearance: 'secondary',
}))({});

const League = styled(Label).attrs(() => ({
  type: 'caption',
  bold: false,
  appearance: 'secondary',
  numberOfLines: 1,
}))({
  flex: 1,
});

const UserImageContainer = styled(TouchHandler)({
  width: 24,
  height: 24,
});

const UserImage = styled.Image({
  width: '100%',
  height: '100%',
});

interface ProfileRowProps {
  userId: string;

  name: string;

  avatarUrl?: string;

  teamName?: string;

  leagueNames?: string[];

  /** Is this user being followed by us? */
  isFollowed: boolean;
}

const _ProfileRow = (props: ProfileRowProps) => {
  const {isFollowed, userId, name, avatarUrl} = props;
  const navigation = useNavigation();

  const {mutate: followUser} = useFollowUser();
  const {mutate: unfollowUser} = useUnfollowUser();

  const {colors} = useTheme();

  const handleUserIconPress = () => {
    isFollowed ? unfollowUser(userId as string) : followUser(userId as string);
  };

  const avatar = avatarUrl && avatarUrl.length !== 0 ? avatarUrl : undefined;

  const handleOnPress = () => {
    navigation.navigate('Profile', {id: userId});
  };

  function renderTeam() {
    if (!props.teamName) return null;

    return <Team>{props.teamName} </Team>;
  }

  function renderLeagues() {
    if (!props.leagueNames || Object.values(props.leagueNames).length === 0)
      return null;

    const commaSeparatedLeagues = Object.values(props.leagueNames).map(
      (x, index) => `${index !== 0 || !!props.teamName ? ', ' : ''}${x}`,
    );

    return <League>{commaSeparatedLeagues}</League>;
  }

  return (
    <TouchHandler onPress={handleOnPress}>
      <Wrapper>
        <ContentContainer>
          <ContentRow>
            <AvatarImage source={require('../../../assets/images/activity_feed/user-1.png')} />
            <ContentRow>
              <UserDetailsContainer>
                <Name>{name}</Name>

                <Row>
                  {renderTeam()}
                  {renderLeagues()}
                </Row>
              </UserDetailsContainer>

              <UserImageContainer onPress={handleUserIconPress} >
                <UserImage 
                  source={
                    isFollowed 
                    ? require('../../../assets/images/icon/users.png') 
                    : require('../../../assets/images/icon/user.png')
                  }
                />
              </UserImageContainer>
            </ContentRow>
          </ContentRow>
        </ContentContainer>
      </Wrapper>
    </TouchHandler>
  );
};

export const ProfileRow = React.memo(
  _ProfileRow,
  (prevProps, nextProps) =>
    prevProps.userId === nextProps.userId &&
    prevProps.isFollowed === nextProps.isFollowed,
);
