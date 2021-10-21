import {Label, Avatar, Button} from '@components';
import {useJoinTeamByCode} from '@hooks';
import React from 'react';
import {View, ViewProps} from 'react-native';
import styled from 'styled-components/native';

const Wrapper = styled.View({justifyContent: 'center', alignItems: 'center'});

const Title = styled(Label).attrs(props => ({
  type: 'title',
  bold: true,
}))({
  marginTop: 20,
  lineHeight: 25,
});

const Description = styled(Label).attrs(props => ({
  type: 'subheading',
}))({
  textAlign: 'center',
  lineHeight: 25,
});

interface TeamInvitationProps extends ViewProps {
  avatar?: string;
  teamName: string;
  code?: string;
  showButtons?: boolean;
  onClose?: (success: boolean) => void;
}

export const TeamInvitation = ({
  avatar,
  teamName,
  showButtons,
  code,
  onClose,
  ...rest
}: TeamInvitationProps) => {
  const {
    mutateAsync: joinTeam,
    isLoading: isJoiningTeam,
    isSuccess: isJoinedTeam,
  } = useJoinTeamByCode();

  return (
    <Wrapper {...rest}>
      <Avatar size={128} url={avatar} />
      <Title>{teamName}</Title>
      <Description>Have invited you to join their Fitlink Team</Description>

      {showButtons && (
        <View style={{marginTop: 40}}>
          <Button
            text={'Accept Invitation'}
            loading={isJoiningTeam || isJoinedTeam}
            loadingText={'Joining team...'}
            disabled={isJoiningTeam || isJoinedTeam}
            onPress={async () => {
              if (!code) {
                console.warn('Code is required.');
                return;
              }

              await joinTeam(code);
              onClose && onClose(true);
            }}
          />
          <View style={{height: 10}} />
          <Button
            textOnly
            text={'Not now'}
            onPress={() => onClose && onClose(false)}
            disabled={isJoiningTeam || isJoinedTeam}
          />
        </View>
      )}
    </Wrapper>
  );
};
