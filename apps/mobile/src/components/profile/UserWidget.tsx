/**
 * Displays an user's avatar, title, and stats
 *
 * @format
 */

import {Avatar, Label, ProgressCircle, TouchHandler} from '../common';
import React from 'react';
import styled from 'styled-components/native';
import {NumberFormatterUtils} from '@utils';
import {useNavigation} from '@react-navigation/core';

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
  // paddingTop: 15,
  paddingLeft: 15,
  flex: 1,
});

const StatContainer = styled.View({
  flexDirection: 'row',
});

const Name = styled(Label).attrs(() => ({
  type: 'title',
  bold: true,
}))({});

const RankContainer = styled.View({
  flexDirection: 'row',
  marginTop: 8,
  marginBottom: 12,
});

const Rank = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'accent',
}))({});

const RankLine = styled.View({
  width: 2,
  height: 10,
  marginTop: 3,
  marginHorizontal: 5,
  backgroundColor: '#565656',
});

const Level = styled(Label).attrs(() => ({
  type: 'caption',
}))({});

const StatValue = styled(Label).attrs(() => ({
  type: 'caption',
}))({});

const StatNumber = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'text',
  bold: true,
}))({});

const StatLabel = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'secondary',
}))({});

const UserStatWrapper = styled(TouchHandler)({marginRight: 15});

const UserStat = ({
  value,
  label,
  tabNumber,
}: {
  value: number;
  label: string;
  tabNumber: number;
}) => {
  const navigation = useNavigation();

  return (
    <UserStatWrapper
      onPress={() => {
        navigation.navigate('Friends', {tab: tabNumber});
      }}>
      <StatValue>
        <StatNumber
          style={{
            fontFamily: 'Roboto',
            fontSize: 13,
            lineHeight: 15.23,
            letterSpacing: 2,
          }}>
          {NumberFormatterUtils.toCommaSeparated(value.toString())}{' '}
        </StatNumber>
        <StatLabel
          style={{
            fontFamily: 'Roboto',
            fontSize: 13,
            lineHeight: 15.23,
            letterSpacing: 1,
          }}>
          {label}
        </StatLabel>
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
        <Name
          style={{
            fontFamily: 'Roboto',
            fontSize: 28,
            lineHeight: 32,
          }}>
          {props.name}
        </Name>

        <RankContainer>
          <Rank
            style={{
              fontFamily: 'Roboto',
              fontSize: 14,
              textTransform: 'uppercase',
              lineHeight: 18,
            }}>
            {props.rank}
          </Rank>
          <RankLine style={{marginHorizontal: 12}} />
          <Level
            style={{
              fontFamily: 'Roboto',
              fontSize: 14,
              textTransform: 'uppercase',
              lineHeight: 18,
            }}>
            {props.rank}
          </Level>
        </RankContainer>

        <StatContainer>
          <UserStat
            value={props.friendCount || 0}
            label={'Following'}
            tabNumber={1}
          />
          <UserStat
            value={props.followerCount || 0}
            label={'Followers'}
            tabNumber={0}
          />
        </StatContainer>
      </ContentContainer>
    </Wrapper>
  );
};
