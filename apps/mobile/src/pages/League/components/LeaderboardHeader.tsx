import {Label} from '@components';
import React from 'react';
import styled from 'styled-components/native';
import {LeaderboardCountback} from './LeaderboardCountback';

const Wrapper = styled.View({
  marginTop: 10,
});

const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const SpacedRow = styled(Row)({
  justifyContent: 'space-between',
});

const MemberCounts = styled(Label).attrs(() => ({
  appearance: 'accent',
  bold: true,
}))({
  fontSize: 16,
  letterSpacing: 1,
  textTransform: 'uppercase',
});

const DividerLine = styled.View({
  marginLeft: 10,
  width: 2,
  height: 14,
  backgroundColor: '#FFFFFF',
});

const Title = styled(Label).attrs({
  type: 'title',
})({
  marginTop: 22,
  fontSize: 32,
});

const Description = styled(Label).attrs({
  type: 'body',
  appearance: 'secondary',
})({
  marginTop: 14,
  color: '#ACACAC',
  fontSize: 18,
  lineHeight: 25,
});

const LeaderboardText = styled(Label).attrs(() => ({
  children: 'Leaderboard',
}))({
  marginTop: 42,
  marginBottom: 11,
  fontSize: 16,
  textTransform: 'uppercase',
  letterSpacing: 1,
});

interface LeaderboardHeaderProps {
  memberCount: number;
  resetDate: Date;
  repeat: boolean;
  title: string;
  description: string;
}

export const LeaderboardHeader = ({
  memberCount,
  resetDate,
  repeat,
  title,
  description,
}: LeaderboardHeaderProps) => (
  <Wrapper>
    <SpacedRow>
      <Row>
        <MemberCounts>
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </MemberCounts>
        <DividerLine />
        <LeaderboardCountback date={resetDate} {...{repeat}} />
      </Row>
    </SpacedRow>
    <Title>{title}</Title>
    <Description>{description}</Description>
    <LeaderboardText />
  </Wrapper>
);
