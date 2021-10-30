/**
 * Displays an user's avatar, title, and stats
 *
 * @format
 */

import {Avatar, Label, ProgressCircle, TouchHandler} from '../common';
import React from 'react';
import styled from 'styled-components/native';
import {NumberFormatterUtils} from '@utils';

interface UserWidgetProps {
  name: string;
  rank: string;
  avatar?: string;
  friendCount: number;
  followerCount: number;
  pointCount: number;
  goalProgress: number;
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

const UserStatWrapper = styled(TouchHandler)({marginRight: 15});

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
        {NumberFormatterUtils.toCommaSeparated(value.toString())}{' '}
        <StatLabel>{label}</StatLabel>
      </StatValue>
    </UserStatWrapper>
  );
};

export const UserWidget = (props: UserWidgetProps) => {
  return (
    <Wrapper>
      <TouchHandler onPress={props.avatarOnPress}>
        <ProgressCircle
          progress={props.goalProgress}
          strokeWidth={3}
          backgroundStrokeWidth={2.5}
          bloomIntensity={0.5}
          bloomRadius={5}
          size={90}>
          <Avatar url={props.avatar} />
        </ProgressCircle>
      </TouchHandler>

      <ContentContainer>
        <Name>{props.name}</Name>
        <Rank>{props.rank}</Rank>

        <Separator />

        <StatContainer>
          <UserStat value={props.friendCount || 0} label={'Friends'} />
          <UserStat value={props.followerCount || 0} label={'Followers'} />
          <UserStat value={props.pointCount || 0} label={'Points'} />
        </StatContainer>
      </ContentContainer>
    </Wrapper>
  );
};
