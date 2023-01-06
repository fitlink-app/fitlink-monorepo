import React from 'react';
import styled from 'styled-components/native';
import {Text} from 'react-native';

const MembersLabel = styled(Text)({
  color: '#00E9D7',
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  textTransform: 'uppercase',
});

export const LeagueCardMembers = ({
  membersCount,
}: {
  membersCount: number;
}): JSX.Element => (
  <MembersLabel>
    {membersCount || 0} <Text style={{color: '#FFFFFF'}}>Members</Text>
  </MembersLabel>
);
