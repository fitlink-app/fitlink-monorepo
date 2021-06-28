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

/** ProfileRow */
type UserAction = (userId: string) => void;

type ProfileRowActions = {
  onFollow: UserAction;
  onUnfollow: UserAction;
  onPress: () => void;
};

interface ProfileRowProps {
  userId: string;

  name: string;

  avatarUrl?: string;

  /** Is this user being followed by us? */
  isFollowed: boolean;

  /** ProfileRow action callbacks */
  actions: ProfileRowActions;
}

const _ProfileRow = (props: ProfileRowProps) => {
  const {isFollowed, actions, userId, name, avatarUrl} = props;

  const {onFollow, onUnfollow, onPress} = actions;

  const {colors} = useTheme();

  const handleUserIconPress = () => {
    isFollowed ? onUnfollow(userId as string) : onFollow(userId as string);
  };

  const avatar =
    avatarUrl && avatarUrl.length !== 0 ? {uri: avatarUrl} : undefined;

  return (
    <TouchHandler onPress={onPress}>
      <Wrapper>
        <ContentContainer>
          <ContentRow>
            <Avatar url={undefined} size={44} />
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
