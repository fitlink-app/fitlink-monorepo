import {useFollowUser, useUnfollowUser} from '@hooks';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Avatar, Label, Icon, TouchHandler} from '../common';

/** Styled Components */
const Wrapper = styled.View({
  width: '100%',
  height: 74,
});

const BottomSeparator = styled.View({
  height: 1,
  marginHorizontal: 20,
  backgroundColor: '#2e2e2e',
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
  alignItems: 'center',
});

const UserDetailsContainer = styled(Flex)({
  justifyContent: 'center',
  marginLeft: 15,
});

const Name = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'primary',
}))({});

const Team = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
  appearance: 'primary',
}))({});

const League = styled(Team).attrs(() => ({
  bold: false,
  appearance: 'secondary',
  numberOfLines: 1,
}))({
  flex: 1,
});

const UserIconButton = styled(Icon)({marginLeft: 45});

interface ProfileRowProps {
  userId: string;

  name: string;

  avatarUrl?: string;

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

  return (
    <TouchHandler onPress={handleOnPress}>
      <Wrapper>
        <ContentContainer>
          <ContentRow>
            <Avatar url={avatar} size={44} />
            <ContentRow>
              <UserDetailsContainer>
                <Name>{name}</Name>

                {/* <Row>
                  {renderTeam()}
                  {renderLeagues()}
                </Row> */}
              </UserDetailsContainer>

              <UserIconButton
                color={isFollowed ? colors.secondaryText : colors.accent}
                name={isFollowed ? 'user-minus' : 'user-plus'}
                size={24}
                onPress={handleUserIconPress}
              />
            </ContentRow>
          </ContentRow>
        </ContentContainer>
        <BottomSeparator />
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
