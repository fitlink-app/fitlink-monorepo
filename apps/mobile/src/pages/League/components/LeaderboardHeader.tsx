import {Label} from '@components';
import React from 'react';
import styled from 'styled-components/native';
import {LeaderboardCountback} from './LeaderboardCountback';

const Wrapper = styled.View(({theme: {colors}}) => ({
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  paddingBottom: 8,
  marginHorizontal: 10,
}));

const Row = styled.View({flexDirection: 'row'});

const SpacedRow = styled(Row)({
  justifyContent: 'space-between',
  paddingHorizontal: 10,
});

const LeaderboardText = styled(Label).attrs(() => ({
  children: 'Leaderboard',
  appearance: 'primary',
  bold: true,
}))({});

const PointsText = styled(Label).attrs(() => ({
  children: 'Points',
  appearance: 'secondary',
}))({});

interface LeaderboardHeaderProps {
  resetDate: Date;
  repeat: boolean;
}

export const LeaderboardHeader = ({
  resetDate,
  repeat,
}: LeaderboardHeaderProps) => (
  <Wrapper>
    <SpacedRow>
      {/* Right side */}
      <Row>
        <LeaderboardText />
        <LeaderboardCountback date={resetDate} {...{repeat}} />
      </Row>

      {/* Left Side */}
      <PointsText />
    </SpacedRow>
  </Wrapper>
);
