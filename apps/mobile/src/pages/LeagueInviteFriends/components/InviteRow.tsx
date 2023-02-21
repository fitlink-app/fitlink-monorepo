import React from 'react';
import styled, {useTheme} from 'styled-components/native';

import {Avatar, Label, Icon, BfitSpinner} from '@components';

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
  paddingRight: 10,
});

const Name = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'primary',
}))({});

const IconContainer = styled.View({
  alignItems: 'center',
  marginLeft: 45,
  width: 40,
});

const Team = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
  appearance: 'primary',
}))({});

const League = styled(Label).attrs(() => ({
  type: 'caption',
  bold: false,
  appearance: 'secondary',
  numberOfLines: 1,
}))({
  flex: 1,
});

interface InviteRowProps {
  userId: string;
  name: string;
  isInvited: boolean;
  teamName?: string;
  leagueNames?: string[];
  avatarSource?: string;
  onInvitePressed: (userId: string) => void;
  isLoading?: boolean;
}

export const InviteRow = (props: InviteRowProps) => {
  const {userId, name, isInvited, avatarSource, onInvitePressed, isLoading} =
    props;

  const {colors} = useTheme();

  const renderIcon = () => {
    if (isLoading) return <BfitSpinner />;

    return (
      <Icon
        color={colors.accent}
        name={'user-plus'}
        size={24}
        onPress={() => onInvitePressed(userId)}
      />
    );
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
    <Wrapper>
      <ContentContainer>
        <ContentRow>
          <Avatar url={avatarSource} size={44} />
          <ContentRow>
            <UserDetailsContainer>
              <Name>{name}</Name>

              <Row>
                {renderTeam()}
                {renderLeagues()}
              </Row>
            </UserDetailsContainer>

            {isInvited ? (
              <Label>Invited</Label>
            ) : (
              <IconContainer>{renderIcon()}</IconContainer>
            )}
          </ContentRow>
        </ContentRow>
      </ContentContainer>
      <BottomSeparator />
    </Wrapper>
  );
};
