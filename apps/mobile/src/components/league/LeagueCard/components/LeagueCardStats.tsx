import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Avatar, Icon, Label} from '../../../common';
import {NumberFormatterUtils} from '@utils';

const Wrapper = styled.View({
  alignItems: 'flex-end',
});

const Col = styled.View({});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

type LeagueInvitation = {
  imageUrl: string;
  name: string;
};

interface LeagueStatsProps {
  memberCount: number;
  position?: number;
  invitation?: LeagueInvitation;
}

export const LeagueStats = (props: LeagueStatsProps) => {
  const {position, memberCount, invitation} = props;

  const {colors} = useTheme();

  function renderPosition() {
    if (!position) return null;

    const icon = position === 1 ? 'crown' : 'trophy';

    return (
      <Row style={{marginBottom: 5}}>
        <Icon
          name={icon}
          size={16}
          color={colors.accent}
          style={{marginRight: 5}}
        />
        <Label appearance={'accent'} type={'body'} bold>
          {NumberFormatterUtils.getNumberWithOrdinal(position)} position
        </Label>
      </Row>
    );
  }

  function renderInvitedBy() {
    if (!invitation) return null;

    return (
      <Row style={{marginBottom: 5}}>
        <Avatar url={invitation.imageUrl} size={28} />

        <Col style={{marginLeft: 5}}>
          <Label appearance={'primary'} type={'caption'}>
            invited by
          </Label>
          <Label appearance={'accent'} type={'caption'}>
            {invitation.name}
          </Label>
        </Col>
      </Row>
    );
  }

  return (
    <Wrapper>
      {renderPosition()}
      {renderInvitedBy()}
      <Label appearance={'primary'} type={'body'}>
        {memberCount || 0} members
      </Label>
    </Wrapper>
  );
};
