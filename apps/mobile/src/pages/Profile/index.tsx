import {
  FeedItem,
  GoalTracker,
  Icon,
  Label,
  Navbar,
  NAVBAR_HEIGHT,
  UserWidget,
} from '@components';
import {
  useFollowUser,
  useMe,
  useUnfollowUser,
  useUser,
  useUserFeed,
  useUserGoals,
} from '@hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  FlatList,
  View,
  InteractionManager,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {RootStackParamList} from 'routes/types';
import {FeedItem as FeedItemType} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {getResultsFromPages} from 'utils/api';
import {queryClient, QueryKeys} from '@query';
import {PrivacySetting} from '@fitlink/api/src/modules/users-settings/users-settings.constants';
import {calculateGoalsPercentage, widthLize} from '@utils';

const Wrapper = styled.View({
  flex: 1,
});

const HeaderContainer = styled.View({
  paddingHorizontal: 20,
});

const WidgetContainer = styled.View({marginTop: 10});

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

  const {data: goals, refetch: refetchGoals} = useUserGoals(id);

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

  const shouldRenderGoals = () => {
    if (!user) return false;

    // @ts-ignore
    switch (user?.privacy_daily_statistics) {
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

  const shouldRenderFeed = () => {
    if (!user) return false;

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

  const renderFeedItem = ({item}: {item: FeedItemType}) => {
    const isLiked = !!(item.likes as UserPublic[]).find(
      (feedItemUser: any) => feedItemUser.id === me?.id,
    );

    return (
      <View style={{paddingHorizontal: widthLize(20)}}>
        <FeedItem
          key={item.id}
          item={item}
          unitSystem={me!.unit_system}
          isLiked={isLiked}
        />
      </View>
    );
  };

  const ListHeaderComponent = !!user ? (
    <>
      <HeaderContainer>
        <WidgetContainer>
          <UserWidget
            goalProgress={goals ? calculateGoalsPercentage(goals) : 0}
            avatar={user!.avatar?.url_512x512}
            name={user!.name}
            rank={user!.rank}
            friendCount={user!.following_total}
            followerCount={user!.followers_total}
            pointCount={user!.points_total}
          />
        </WidgetContainer>

        <WidgetContainer>
          {shouldRenderGoals() && (
            <GoalTracker
              isLocalUser={false}
              trackers={[
                {
                  identifier: 'steps',
                  goal: {
                    value: goals?.current_steps || 0,
                    target: goals?.target_steps || 0,
                  },
                  icon: 'steps',
                },
                {
                  identifier: 'mindfulness',
                  goal: {
                    value: goals?.current_mindfulness_minutes || 0,
                    target: goals?.target_mindfulness_minutes || 0,
                  },
                  icon: 'yoga',
                },
                {
                  identifier: 'water',
                  goal: {
                    value: goals?.current_water_litres || 0,
                    target: goals?.target_water_litres || 0,
                  },
                  icon: 'water',
                },
                {
                  identifier: 'sleep',
                  goal: {
                    value: goals?.current_sleep_hours || 0,
                    target: goals?.target_sleep_hours || 0,
                  },
                  icon: 'sleep',
                },
                {
                  identifier: 'active_minutes',
                  goal: {
                    value: goals?.current_active_minutes || 0,
                    target: goals?.target_active_minutes || 0,
                  },
                  icon: 'stopwatch',
                },
                {
                  identifier: 'floors',
                  goal: {
                    value: goals?.current_floors_climbed || 0,
                    target: goals?.target_floors_climbed || 0,
                  },
                  icon: 'stairs',
                },
              ]}
            />
          )}
        </WidgetContainer>
      </HeaderContainer>

      <WidgetContainer>
        <FeedHeaderWrapper>
          <Label type={'subheading'} appearance={'primary'}>
            Recent Activities
          </Label>
        </FeedHeaderWrapper>
      </WidgetContainer>
    </>
  ) : null;

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
          <ActivityIndicator color={colors.accent} />
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
    <View style={{height: 72, alignItems: 'center', justifyContent: 'center'}}>
      <ActivityIndicator color={colors.accent} />
    </View>
  ) : null;

  const visibleFeedData = shouldRenderFeed() ? feedItems : ([] as any);

  return (
    <Wrapper>
      {isUserFetched ? (
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
            paddingBottom: insets.bottom + 75,
            paddingTop: Platform.OS === 'ios' ? 0 : NAVBAR_HEIGHT + insets.top,
          }}
        />
      ) : (
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      )}

      <Navbar
        backButtonLabel={'Back'}
        overlay
        rightComponent={isUserFetched ? FollowButton : undefined}
      />
    </Wrapper>
  );
};
