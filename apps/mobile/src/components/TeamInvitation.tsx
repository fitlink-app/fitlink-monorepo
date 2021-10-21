import {Label, Avatar} from '@components';
import React from 'react';
import {ViewProps} from 'react-native';
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
}

export const TeamInvitation = ({
  avatar,
  teamName,
  ...rest
}: TeamInvitationProps) => {
  return (
    <Wrapper {...rest}>
      <Avatar size={100} url={avatar} />
      <Title>{teamName}</Title>
      <Description>Have invited you to join their Fitlink Team</Description>
    </Wrapper>
  );
};
