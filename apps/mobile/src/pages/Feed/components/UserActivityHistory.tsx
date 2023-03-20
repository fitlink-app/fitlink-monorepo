import React, {FC} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/core';
import {BlurView} from '@react-native-community/blur';
import styled from 'styled-components/native';

import {TouchHandler, Card, Label} from '@components';
import {FeedItem as FeedItemType} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {widthLize} from '@utils';
import {useFeed} from '@hooks';

import {memoSelectFeedPreferences} from '../../../redux/feedPreferences/feedPreferencesSlice';
import moment from 'moment';
import {FEED_CARD_HEIGHT, FEED_CAROUSEL_CARD_WIDTH} from '../constants';
import {getResultsFromPages} from '../../../utils/api';
import {HorizontalSliderSkeleton} from '../../../components/skeleton/HorizontalSliderSkeleton';

interface ActivityHistoryProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export const UserActivityHistory: FC<ActivityHistoryProps> = ({
  containerStyle,
}) => {
  const navigation = useNavigation();
  const feedPreferences = useSelector(memoSelectFeedPreferences);

  const {data: feed, isLoading: isLoading} = useFeed({
    my_goals: feedPreferences.showGoals,
    my_updates: feedPreferences.showUpdates,
    friends_activities: false,
  });

  const activities = getResultsFromPages<FeedItemType>(feed).filter(
    ({health_activity}) => !!health_activity?.id,
  );

  if (isLoading) {
    return (
      <View style={containerStyle}>
        <HorizontalSliderSkeleton />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <HeaderContainer>
        <Title>Activity History</Title>
        <TouchHandler
          onPress={() => {
            navigation.navigate('ActivityFeed');
          }}
        >
          <SeeAllText>see all</SeeAllText>
        </TouchHandler>
      </HeaderContainer>

      <SliderContainer>
        <>
          {activities.map(({health_activity}, index) => {
            const activityImgUrl =
              health_activity?.images[0]?.url_640x360 ??
              health_activity?.sport.image_url;
            const {id, start_time, title, points} = health_activity ?? {};

            return (
              <TouchHandler
                key={index}
                onPress={() => {
                  navigation.navigate('ActivityPage', {id: id!});
                }}
              >
                <CardContainer>
                  <CardImage source={{uri: activityImgUrl}} />
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
                    <DateText>{moment(start_time).calendar()}</DateText>
                  </CardHeader>
                  <Line />
                  <CardBody>
                    <PlaceText>{title}</PlaceText>
                    <RecordValue>{points} points</RecordValue>
                  </CardBody>
                </CardContainer>
              </TouchHandler>
            );
          })}
        </>
      </SliderContainer>
    </View>
  );
};

const HeaderContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
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
  width: FEED_CAROUSEL_CARD_WIDTH,
  height: FEED_CARD_HEIGHT,
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
  paddingHorizontal: 24,
  paddingBottom: 24,
  justifyContent: 'flex-end',
});

const RecordValue = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'capitalize',
  marginTop: 11,
});

const PlaceText = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'accent',
}))({
  fontSize: 18,
  lineHeight: 21,
});
