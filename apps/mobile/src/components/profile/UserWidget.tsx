/**
 * Displays an user's avatar, title, and stats
 *
 * @format
 */

import {Avatar, Label} from '../common';
import React from 'react';
import styled from 'styled-components/native';
import {TouchableOpacity, View} from 'react-native';

interface UserWidgetProps {
  name: string;
  rank: string;
  avatar?: string;
  friendCount: number;
  followerCount: number;
  pointCount: number;
  avatarOnPress?: () => void;
  friendsOnPress?: () => void;
  followersOnPress?: () => void;
  pointsOnPress?: () => void;
}

const Wrapper = styled.View({
  flexDirection: 'row',
  width: '100%',
});

const ContentContainer = styled.View({
  justifyContent: 'center',
  paddingLeft: 15,
  flex: 1,
});

const StatContainer = styled.View({
  flexDirection: 'row',
});

const Separator = styled.View(({theme: {colors}}) => ({
  width: '100%',
  height: 1,
  marginVertical: 5,
  backgroundColor: colors.separator,
}));

const Name = styled(Label).attrs(() => ({
  type: 'title',
  bold: true,
}))({});

const Rank = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'secondary',
}))({});

const StatValue = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'accent',
}))({});

const StatLabel = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'secondary',
}))({});

const UserStatWrapper = styled(TouchableOpacity)({marginRight: 15});

const UserStat = ({
  value,
  label,
  onPress,
}: {
  value: number;
  label: string;
  onPress?: () => void;
}) => {
  return (
    <UserStatWrapper {...onPress}>
      <StatValue>
        {value} <StatLabel>{label}</StatLabel>
      </StatValue>
    </UserStatWrapper>
  );
};

export const UserWidget = (props: UserWidgetProps) => {
  return (
    <Wrapper>
      <TouchableOpacity onPress={props.avatarOnPress}>
        <Avatar url={props.avatar} />
      </TouchableOpacity>

      <ContentContainer>
        <Name>{props.name}</Name>
        <Rank>{props.rank}</Rank>

        <Separator />

        <StatContainer>
          <UserStat value={props.friendCount} label={'Friends'} />
          <UserStat value={props.followerCount} label={'Followers'} />
          <UserStat value={props.pointCount} label={'Points'} />
          <View />
        </StatContainer>
      </ContentContainer>
    </Wrapper>
  );
};
