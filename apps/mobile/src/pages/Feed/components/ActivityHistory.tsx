import React, {useMemo} from 'react';
import styled from 'styled-components/native';
import {TouchHandler, Card, Label} from '@components';
import {useNavigation} from '@react-navigation/core';
import {BlurView} from '@react-native-community/blur';
import {formatDate, widthLize} from '@utils';
import {useSelector} from 'react-redux';
import {memoSelectFeedPreferences} from '../../../redux/feedPreferences/feedPreferencesSlice';
import {useFeed} from '@hooks';
import moment from 'moment';

const Wrapper = styled.View({
  // paddingLeft: widthLize(20),
});

const HeaderContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 40,
  marginHorizontal: widthLize(20),
});

const Title = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 2,
  textTransform: 'uppercase',
});

const SeeAllText = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontSize: 13,
  lineHeight: 15,
  letterSpacing: 1,
  textTransform: 'capitalize',
  color: '#ACACAC',
});

const SliderContainer = styled.ScrollView.attrs(() => ({
  horizontal: true,
  overScrollMode: 'never',
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    justifyContent: 'space-between',
    paddingLeft: widthLize(20),
  },
}))({});

const CardContainer = styled(Card)({
  width: 327,
  height: 175,
  marginTop: 23,
  marginRight: 14,
  overflow: 'hidden',
});

const CardImage = styled.Image({
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const CardHeader = styled.View({
  position: 'relative',
  width: '100%',
  height: 53,
  paddingTop: 22,
  paddingLeft: 24,
  paddingRight: 24,
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const DateText = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  position: 'relative',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'uppercase',
  opacity: 0.6,
});

const Line = styled.View({
  position: 'relative',
  width: '100%',
  height: 2,
  backgroundColor: '#ffffff',
  border: 0,
  opacity: 0.2,
});

const CardBody = styled.View({
  width: '100%',
  height: 120,
  paddingTop: 34,
  paddingLeft: 24,
  paddingRight: 18,
});

const PlaceSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 4,
});

const RecordValue = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'capitalize',
  width: 194,
});

const PlaceText = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'accent',
}))({
  fontSize: 18,
  lineHeight: 21,
});

const data = [
  {
    date: '1:24 PM',
    record_today: 'Congratulations You Swam 45 Min Today',
    place: 'Swimming',
    img: require('../../../../assets/images/history-1.png'),
  },
  {
    date: '1:24 PM',
    record_today: 'Congratulations You Swam 45 Min Today',
    place: 'Climbing',
    img: require('../../../../assets/images/history-1.png'),
  },
];

export const ActivityHistory = () => {
  const navigation = useNavigation();
  const feedPreferences = useSelector(memoSelectFeedPreferences);

  const {
    data: feed,
    refetch: refetchFeed,
    fetchNextPage: fetchFeedNextPage,
    isFetchingNextPage: isFeedFetchingNextPage,
    isFetchedAfterMount: isFeedFetchedAfterMount,
  } = useFeed({
    my_goals: feedPreferences.showGoals,
    friends_activities: feedPreferences.showFriends,
    my_updates: feedPreferences.showUpdates,
  });

  const activities = useMemo(() => {
    return feed?.pages[0].results.filter(e => e.category === 'my_activities');
  }, [feed]);

  return (
    <Wrapper>
      <HeaderContainer>
        <Title>Activity History</Title>
        <TouchHandler
          onPress={() => {
            navigation.navigate('ActivityFeed');
          }}>
          <SeeAllText>see all</SeeAllText>
        </TouchHandler>
      </HeaderContainer>

      <SliderContainer>
        <>
          {activities?.map((item, index) => (
            <TouchHandler
              key={index}
              onPress={() => {
                navigation.navigate('ActivityPage', {
                  id: item.health_activity!.id,
                });
              }}>
              <CardContainer>
                <CardImage
                  source={{uri: item?.health_activity?.sport.image_url}}
                />
                <BlurView
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: 53,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                  }}
                  blurRadius={1}
                  overlayColor={'transparent'}
                />
                <CardHeader>
                  <DateText>
                    {moment(item?.health_activity?.start_time).calendar()}
                  </DateText>
                </CardHeader>
                <Line />
                <CardBody>
                  <RecordValue>
                    {item?.health_activity?.points} points
                  </RecordValue>
                  <PlaceSection>
                    <PlaceText>{item?.health_activity?.title}</PlaceText>
                  </PlaceSection>
                </CardBody>
              </CardContainer>
            </TouchHandler>
          ))}
        </>
      </SliderContainer>
    </Wrapper>
  );
};
