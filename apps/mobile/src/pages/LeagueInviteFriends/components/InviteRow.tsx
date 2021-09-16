import React from 'react';
import {ActivityIndicator} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {Avatar, Label, Icon} from '@components';

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

const IconContainer = styled.View({
  alignItems: 'center',
  marginLeft: 45,
  width: 40,
});

interface InviteRowProps {
  userId: string;
  name: string;
  isInvited: boolean;
  avatarSource?: string;
  onInvitePressed: (userId: string) => void;
  isLoading?: boolean;
}

export const InviteRow = (props: InviteRowProps) => {
  const {userId, name, isInvited, avatarSource, onInvitePressed, isLoading} =
    props;

  const {colors} = useTheme();

  const renderIcon = () => {
    if (isLoading) return <ActivityIndicator color={colors.accent} />;

    return (
      <Icon
        color={colors.accent}
        name={'user-plus'}
        size={24}
        onPress={() => onInvitePressed(userId)}
      />
    );
  };

  return (
    <Wrapper>
      <ContentContainer>
        <ContentRow>
          <Avatar url={avatarSource} size={44} />
          <ContentRow>
            <UserDetailsContainer>
              <Name>{name}</Name>
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
