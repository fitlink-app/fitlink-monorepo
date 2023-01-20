import React, {useState, useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
  Image,
} from 'react-native';
import {useMe, useFeed, useModal} from '@hooks';
import {useNavigation, useScrollToTop} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {memoSelectFeedPreferences} from 'redux/feedPreferences/feedPreferencesSlice';
import {useSelector} from 'react-redux';
import {getResultsFromPages} from 'utils/api';
import {FeedItem as FeedItemType} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import styled, {useTheme} from 'styled-components/native';
import {queryClient, QueryKeys} from '@query';
import {FeedItem, TouchHandler, Modal} from '@components';
import {Filter} from 'components/feed/FeedFilter/components';

const Wrapper = styled.View({flex: 1});

const SFeedItemSeparator = styled.View({
  height: 3,
  backgroundColor: '#565656',
  paddingHorizontal: 20,
});

const ListFooterContainer = styled.View({
  justifyContent: 'flex-end',
});

export const ActivityFeed = () => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
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
  } = useFeed({
    my_goals: feedPreferences.showGoals,
    friends_activities: feedPreferences.showFriends,
    my_updates: feedPreferences.showUpdates,
  });

  const [isPulledDown, setIsPulledDown] = useState(false);
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
      <View
        style={{
          flexDirection: 'row',
          paddingTop: 12,
          marginBottom: 30,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            color: colors.accent,
            fontWeight: '600',
            fontSize: 15,
            lineHeight: 17.75,
          }}>
          FEED
        </Text>
        <TouchHandler
          style={{position: 'absolute', top: 12, right: 0}}
          onPress={() => {
            handleFilterPressed();
          }}>
          <Image source={require('../../../assets/images/filter.png')} />
        </TouchHandler>
      </View>
      <FlatList
        ItemSeparatorComponent={SFeedItemSeparator}
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
