import React, {useEffect, useState} from 'react';
import {
  RefreshControl,
  FlatList,
  View,
  InteractionManager,
  Platform,
  ListRenderItem,
  StyleSheet,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {RootStackParamList} from 'routes/types';

import {
  FeedItem,
  Icon,
  Label,
  Navbar,
  NAVBAR_HEIGHT,
  ProfileHeader,
  BfitSpinner,
} from '@components';
import {
  useFollowUser,
  useMe,
  useUnfollowUser,
  useUser,
  useUserFeed,
  useUserGoals,
} from '@hooks';
import {queryClient, QueryKeys} from '@query';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {FeedItem as FeedItemType} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {PrivacySetting} from '@fitlink/api/src/modules/users-settings/users-settings.constants';

import {getResultsFromPages} from 'utils/api';
import {BOTTOM_TAB_BAR_HEIGHT} from '../../routes/Home/components';

const Wrapper = styled.View({
  flex: 1,
});

const FeedHeaderWrapper = styled.View(({theme: {colors}}) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingBottom: 10,
  marginTop: 10,
  borderBottomWidth: 1,
  borderColor: colors.separator,
}));

const LoadingContainer = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

export const Profile = (
  props: StackScreenProps<RootStackParamList, 'Profile'>,
) => {
  const {id} = props.route.params;

  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  const {data: me} = useMe({enabled: false});

  const [areInteractionsDone, setInteractionsDone] = useState(false);

  const {
    data: user,
    isFetched: isUserFetched,
    refetch: refetchUser,
  } = useUser({userId: id, options: {enabled: areInteractionsDone}});

  const {
    data: feedData,
    isLoading: isFeedLoading,
    isFetchedAfterMount: isFeedFetchedAfterMount,
    refetch: refetchFeed,
    fetchNextPage: fetchFeedNextPage,
    isFetchingNextPage: isFetchingFeedNextPage,
  } = useUserFeed(id);

  const feedItems = getResultsFromPages<FeedItemType>(feedData);

  const {refetch: refetchGoals} = useUserGoals(id);

  const {mutate: followUser} = useFollowUser();
  const {mutate: unfollowUser} = useUnfollowUser();

  const [isFetchingManually, setIsFetchingManually] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setInteractionsDone(true);
    });
  }, []);

  const handleOnFollowPressed = () => {
    followUser(id);
  };

  const handleOnUnfollowPressed = () => {
    unfollowUser(id);
  };

  const handleOnRefresh = async () => {
    setIsFetchingManually(true);
    queryClient.setQueryData([QueryKeys.UserFeed, id], (data: any) => {
      return {
        pages: data.pages.length ? [data.pages[0]] : data.pages,
        pageParams: data.pageParams.length
          ? [data.pageParams[0]]
          : data.pageParams,
      };
    });

    Promise.all([refetchUser, refetchFeed, refetchGoals]).finally(() => {
      setIsFetchingManually(false);
    });
  };

  const shouldRenderFeed = () => {
    if (!user) {
      return false;
    }

    // @ts-ignore
    switch (user?.privacy_activities) {
      case PrivacySetting.Public:
        return true;

      case PrivacySetting.Private:
        return false;

      case PrivacySetting.Following:
        return user.following;

      default:
        return false;
    }
  };

  const FollowButton = user?.following ? (
    <Icon
      name={'user-minus'}
      size={24}
      color={colors.accentSecondary}
      onPress={handleOnUnfollowPressed}
    />
  ) : (
    <Icon
      name={'user-plus'}
      size={24}
      color={colors.accent}
      onPress={handleOnFollowPressed}
    />
  );

  const renderFeedItem: ListRenderItem<FeedItemType> = ({item, index}) => {
    const isLiked = !!(item.likes as UserPublic[]).find(
      (feedItemUser: any) => feedItemUser.id === me?.id,
    );

    return (
      <FeedItem
        key={item.id}
        item={item}
        unitSystem={me!.unit_system}
        isLiked={isLiked}
        index={index}
      />
    );
  };

  const ListHeaderComponent = () => (
    <>
      <ProfileHeader
        user={user}
        isLocalUser={false}
        // TODO: temporary not showing goals of user since there is no API
        showGoals={false}
      />
      <FeedHeaderWrapper>
        <Label type={'subheading'} appearance={'primary'}>
          Recent Activities
        </Label>
      </FeedHeaderWrapper>
    </>
  );

  const ListEmptyComponent = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: -100,
        }}>
        {isFeedLoading || !isFeedFetchedAfterMount ? (
          <BfitSpinner />
        ) : (
          <Label
            type="body"
            appearance={'accentSecondary'}
            style={{textAlign: 'center'}}>
            {shouldRenderFeed()
              ? 'No recent activities.'
              : 'This feed is set to private.'}
          </Label>
        )}
      </View>
    );
  };

  const ListFooterComponent = isFetchingFeedNextPage ? (
    <BfitSpinner wrapperStyle={styles.listFooterComponent} />
  ) : null;

  const visibleFeedData = shouldRenderFeed() ? feedItems : [];

  if (!isUserFetched) {
    return (
      <LoadingContainer>
        <BfitSpinner />
      </LoadingContainer>
    );
  }

  return (
    <Wrapper>
      <Navbar
        overlay
        rightComponent={isUserFetched ? FollowButton : undefined}
      />
      <FlatList
        {...{ListHeaderComponent, ListEmptyComponent, ListFooterComponent}}
        renderItem={renderFeedItem}
        data={visibleFeedData}
        onEndReachedThreshold={0.2}
        onEndReached={() => fetchFeedNextPage()}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={isFetchingManually}
            onRefresh={handleOnRefresh}
          />
        }
        contentInset={{
          top: NAVBAR_HEIGHT + insets.top,
          bottom: -(NAVBAR_HEIGHT + insets.top),
        }}
        contentOffset={{x: 0, y: -(NAVBAR_HEIGHT + insets.top)}}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + BOTTOM_TAB_BAR_HEIGHT,
          paddingTop: Platform.OS === 'ios' ? 10 : NAVBAR_HEIGHT + insets.top,
        }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  listFooterComponent: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
