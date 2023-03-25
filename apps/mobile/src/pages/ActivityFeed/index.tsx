import React, {useEffect, useRef} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {useNavigation, useScrollToTop} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import styled, {useTheme} from 'styled-components/native';

import {queryClient, QueryKeys} from '@query';
import {useMe, useFeed, useModal, useManualQueryRefresh} from '@hooks';
import {
  FeedItem,
  TouchHandler,
  Modal,
  BfitSpinner,
  getComponentsList,
  BottomTabNavigationHeader,
} from '@components';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {FeedItem as FeedItemType} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';

import {getResultsFromPages} from 'utils/api';
import {Filter} from 'components/feed/FeedFilter/components';
import {memoSelectFeedPreferences} from 'redux/feedPreferences/feedPreferencesSlice';
import {FeedItemSkeleton} from './components/FeedItemSkeleton';

const Wrapper = styled.View({flex: 1});

const ListFooterContainer = styled.View({
  justifyContent: 'flex-end',
});

const SImage = styled.Image({
  flex: 1,
  width: 22,
  height: 20,
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
    isLoading: isLoading,
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

  const SettingsButton = () => {
    return (
      <TouchHandler
        style={{position: 'absolute', right: 20}}
        onPress={() => {
          handleFilterPressed();
        }}
      >
        <SImage source={require('../../../assets/images/filter.png')} />
      </TouchHandler>
    );
  };

  return (
    <Wrapper style={{marginTop: insets.top}}>
      {isLoading && (
        <>
          <BottomTabNavigationHeader buttonRight={<SettingsButton />} />
          {getComponentsList(7, FeedItemSkeleton)}
        </>
      )}

      <FlatList
        ListHeaderComponent={
          <BottomTabNavigationHeader buttonRight={<SettingsButton />} />
        }
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
            {isFeedFetchingNextPage && <BfitSpinner />}
            <View style={{height: 20}} />
          </ListFooterContainer>
        }
      />
    </Wrapper>
  );
};
