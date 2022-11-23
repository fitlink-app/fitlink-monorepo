import React from 'react';
import {ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Card, Label } from '@components';
import { ActivityItem } from './components/ActivityItem';

const Wrapper = styled.View({flex: 1});

const CoverImage = styled(Card)({
  width: '100%',
  height: 237,
  overflow: 'hidden',
  marginBottom: 5,
});

const CoverBackgroundImage = styled.Image({
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const CoverInfo = styled.View({
  width: 253,
  marginLeft: 21,
});

const CoverTitle = styled(Label).attrs(() => ({
  type: 'title',
}))({});

const CoverDate = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'accent',
}))({});

const UserList = styled.View({
  marginBottom: 38,
});

const data = [
  {
    img: '../../../assets/images/activity_feed/user-1.png',
    fitness_type: 'Morning Run',
    username: 'Jon Smith',
    date: 'Today at 9:28 AM',
    mark: '7 $BFIT',
    like: true,
    distance: '4.97',
    speed: '8:22',
    time: 43,
  },
  {
    img: '../../../assets/images/activity_feed/user-2.png',
    fitness_type: 'Morning Yoga Session',
    username: 'Jennifer',
    date: 'Today at 7:30 AM',
    mark: '13 $BFIT',
    like: false,
    distance: '12.47',
    speed: '25:04',
    time: 65,
  },
  {
    img: '../../../assets/images/activity_feed/user-3.png',
    fitness_type: 'Early Morning Run',
    username: 'Jennifer',
    date: 'Today at 9:28 AM',
    mark: '22 $BFIT',
    like: true,
    distance: '6.90',
    speed: '12:04',
    time: 45,
  },
  {
    img: '../../../assets/images/activity_feed/user-4.png',
    fitness_type: 'Morning Run',
    username: 'Adam',
    date: 'Today at 5:30 AM',
    mark: '44 Points',
    like: false,
    distance: '2.90',
    speed: '8:22',
    time: 56,
  },
];

export const ActivityFeed = () => {
  const insets = useSafeAreaInsets();

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: 37,
        }}>
        <CoverImage>
          <CoverBackgroundImage
            source={require('../../../assets/images/activity_feed/cover-1.png')}
          />
          <CoverInfo style={{marginTop: 137}}>
            <CoverTitle
              style={{
                fontFamily: 'Roboto',
                fontSize: 22,
                fontWeight: '500',
                lineHeight: 26,
              }}>
              10-minute Mindfulness Exercises You Can Do
            </CoverTitle>
            <CoverDate style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
              <Label
                type="caption"
                style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
                Fitlink
              </Label>{' '}
              - Tuesday at 9:28 AM
            </CoverDate>
          </CoverInfo>
        </CoverImage>
        <UserList>
          {data.map((item) => (
            <ActivityItem
              fitnessType={item.fitness_type}
              username={item.username}
              date={item.date}
              mark={item.mark}
              like={item.like}
              distance={item.distance}
              speed={item.speed}
              time={item.time}
            />
          )
          )}
        </UserList>
        <CoverImage>
          <CoverBackgroundImage
            source={require('../../../assets/images/activity_feed/cover-2.png')}
          />
          <CoverInfo style={{marginTop: 113}}>
            <CoverTitle
              style={{
                fontFamily: 'Roboto',
                fontSize: 22,
                fontWeight: '500',
                lineHeight: 26,
              }}>
              Why Trees Are Good For Our Mental & Physical Wellbeing
            </CoverTitle>
            <CoverDate style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
              <Label
                type="caption"
                style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
                Fitlink
              </Label>{' '}
              - Tuesday at 9:28 AM
            </CoverDate>
          </CoverInfo>
        </CoverImage>
      </ScrollView>
    </Wrapper>
  );
};
