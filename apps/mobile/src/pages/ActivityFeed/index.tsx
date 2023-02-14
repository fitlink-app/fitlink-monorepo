import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, View} from 'react-native';
import {useNavigation, useScrollToTop} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import styled, {useTheme} from 'styled-components/native';

import {queryClient, QueryKeys} from '@query';
import {useMe, useFeed, useModal, useManualQueryRefresh} from '@hooks';
import {FeedItem, TouchHandler, Modal} from '@components';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {FeedItem as FeedItemType} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';

import {getResultsFromPages} from 'utils/api';
import theme from '../../theme/themes/fitlink';
import {Filter} from 'components/feed/FeedFilter/components';
import {memoSelectFeedPreferences} from 'redux/feedPreferences/feedPreferencesSlice';

const Wrapper = styled.View({flex: 1});

const ListFooterContainer = styled.View({
  justifyContent: 'flex-end',
});

const SImage = styled.Image({
  flex: 1,
  width: 22,
  height: 20,
  resizeMode: 'contain',
});

const SHeader = styled.View({
  flexDirection: 'row',
  paddingTop: 12,
  marginBottom: 30,
  justifyContent: 'center',
});

const SHeaderTitle = styled.Text({
  color: theme.colors.accent,
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 17.75,
});

export const ActivityFeed = () => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const navigation = useNavigation();

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const {data: user} = useMe();

  const feedPreferences = useSelector(memoSelectFeedPreferences);

  const {
    data: feed,
    refetch: refetchFeed,
    fetchNextPage: fetchFeedNextPage,
    isFetchingNextPage: isFeedFetchingNextPage,
  } = useFeed({
    my_goals: feedPreferences.showGoals,
    friends_activities: feedPreferences.showFriends,
    my_updates: feedPreferences.showUpdates,
  });

  const {openModal, closeModal} = useModal();

  const feedResults = getResultsFromPages<FeedItemType>(feed);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetchFeed();
    });

    return unsubscribe;
  }, [navigation, refetchFeed]);

  useEffect(() => {
    queryClient.removeQueries(QueryKeys.Feed);
    refetchFeed();
  }, [feedPreferences, refetchFeed]);

  const {refresh, isRefreshing} = useManualQueryRefresh(refetchFeed);

  const keyExtractor = (item: FeedItemType) => item.id as string;

  const renderItem = ({item, index}: {item: FeedItemType; index: number}) => {
    const isLiked = !!(item.likes as UserPublic[]).find(
      (feedItemUser: any) => feedItemUser.id === user?.id,
    );
    return (
      <FeedItem
        item={item}
        // @ts-ignore
        unitSystem={user?.unit_system}
        isLiked={isLiked}
        index={index}
      />
    );
  };

  const handleFilterPressed = () => {
    openModal(id => {
      return (
        <Modal title={'Customize Your Feed'}>
          <Filter onSavePreferences={() => closeModal(id)} />
        </Modal>
      );
    });
  };

  const onCheckScrollToEnd = (e: any) => {
    const {layoutMeasurement, contentOffset, contentSize} = e;
    const paddingToBottom = 120;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      fetchFeedNextPage();
    }
  };

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <SHeader>
        <SHeaderTitle>FEED</SHeaderTitle>
        <TouchHandler
          style={{position: 'absolute', top: 10, right: 20}}
          onPress={() => {
            handleFilterPressed();
          }}>
          <SImage source={require('../../../assets/images/filter.png')} />
        </TouchHandler>
      </SHeader>
      <FlatList
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ref={scrollRef}
        data={feedResults}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 44 + 79,
        }}
        onMomentumScrollEnd={({nativeEvent}: {nativeEvent: any}) => {
          onCheckScrollToEnd(nativeEvent);
        }}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={isRefreshing}
            onRefresh={refresh}
          />
        }
        ListFooterComponent={
          <ListFooterContainer>
            {isFeedFetchingNextPage && (
              <ActivityIndicator color={colors.accent} />
            )}
            <View style={{height: 20}} />
          </ListFooterContainer>
        }
      />
    </Wrapper>
  );
};
