import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  FlatList,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useMe, useFeed } from '@hooks';
import {useNavigation, useScrollToTop} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {memoSelectFeedPreferences} from 'redux/feedPreferences/feedPreferencesSlice';
import {useSelector} from 'react-redux';
import {getResultsFromPages} from 'utils/api';
import {FeedItem as FeedItemType} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import styled, { useTheme } from 'styled-components/native';
import {queryClient, QueryKeys} from '@query';
import { Card, Label, FeedItem } from '@components';
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

const ListFooterContainer = styled.View({
  justifyContent: 'flex-end'
});

export const ActivityFeed = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const {data: user} = useMe({
    refetchOnMount: false,
    refetchInterval: 10000,
  });

  const feedPreferences = useSelector(memoSelectFeedPreferences);

  const {
    data: feed,
    refetch: refetchFeed,
    fetchNextPage: fetchFeedNextPage,
    isFetchingNextPage: isFeedFetchingNextPage,
    isFetchedAfterMount: isFeedFetchedAfterMount,
    error: feedError,
  } = useFeed({
    my_goals: feedPreferences.showGoals,
    friends_activities: feedPreferences.showFriends,
    my_updates: feedPreferences.showUpdates,
  });

  const [isPulledDown, setIsPulledDown] = useState(false);

  const feedResults = getResultsFromPages<FeedItemType>(feed);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetchFeed();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    queryClient.removeQueries(QueryKeys.Feed);
    refetchFeed();
  }, [feedPreferences]);

  const keyExtractor = (item: FeedItemType) => item.id as string;

  const renderItem = ({item}: {item: FeedItemType}) => {
    const isLiked = !!(item.likes as UserPublic[]).find(
      (feedItemUser: any) => feedItemUser.id === user?.id,
    );

    return (
      <FeedItem item={item} unitSystem={user.unit_system} isLiked={isLiked} />
    );
  };

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: 37,
        }}>
        <FlatList
          {...{renderItem, keyExtractor}}
          ref={scrollRef}
          data={feedResults}
          showsVerticalScrollIndicator={false}
          style={{overflow: 'visible'}}
          contentContainerStyle={{
            minHeight: '100%',
            paddingBottom:
              Platform.OS === 'ios' ? 0 : isFeedFetchingNextPage ? 0 : 72,
          }}
          onEndReachedThreshold={0.2}
          onEndReached={() => fetchFeedNextPage()}
          refreshControl={
            <RefreshControl
              tintColor={colors.accent}
              refreshing={isPulledDown && isFeedFetchedAfterMount}
              onRefresh={() => {
                setIsPulledDown(true);

                queryClient.setQueryData(QueryKeys.Feed, (data: any) => {
                  return {
                    pages: data.pages.length ? [data.pages[0]] : data.pages,
                    pageParams: data.pageParams.length
                      ? [data.pageParams[0]]
                      : data.pageParams,
                  };
                });

                refetchFeed().finally(() => {
                  setIsPulledDown(false);
                });
              }}
            />
          }
          ListHeaderComponent={
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
          }
          ListFooterComponent={
            <ListFooterContainer>
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
            </ListFooterContainer>
          }
        />
      </ScrollView>
    </Wrapper>
  );
};
