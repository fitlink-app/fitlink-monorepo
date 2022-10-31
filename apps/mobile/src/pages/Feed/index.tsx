import {
  FeedFilter,
  FeedItem,
  GoalTracker,
  Icon,
  Modal,
  RewardTracker,
} from '@components';
import {
  useFeed,
  useGoals,
  useMe,
  useModal,
  useNextReward,
  useProviders,
  useUpdateIntercomUser,
} from '@hooks';
import {UserWidget} from '@components';
import {Card, CardLabel, Label, ProgressCircle} from '../../components/common';
import React, {useEffect, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  View,
} from 'react-native';
import {useNavigation, useScrollToTop} from '@react-navigation/native';
import {calculateGoalsPercentage, getPersistedData, persistData} from '@utils';
import {NewsletterModal} from './components';
import {useSelector} from 'react-redux';
import {memoSelectFeedPreferences} from 'redux/feedPreferences/feedPreferencesSlice';
import {getResultsFromPages} from 'utils/api';
import {FeedItem as FeedItemType} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {queryClient, QueryKeys} from '@query';
import {getErrorMessage} from '@fitlink/api-sdk';
import {saveCurrentToken} from '@api';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {CompeteLeagues} from './components/CompeteLeagues';
import {UnlockedRewards} from './components/UnlockedRewards';
import {ActivityHistory} from './components/ActivityHistory';
import {RoutesClasses} from './components/RoutesClasses';

const Wrapper = styled.View({flex: 1});

const TopButtonRow = styled.View({
  position: 'absolute',
  right: 20,
  flexDirection: 'row',
});

const TopButtonSpacer = styled.View({width: 10});

// const SettingsButton = styled(Icon).attrs(({theme: {colors}}) => ({
//   name: 'gear',
//   size: 20,
//   color: colors.text,
// }))({});

const NotificationsButton = styled.Image({});

const SettingsButton = styled.Image({});

const HeaderContainer = styled.View({
  paddingHorizontal: 20,
  marginVertical: 10,
});

const HeaderWidgetContainer = styled.View({marginTop: 10});

const StatContainer = styled.View({});

const StatCard = styled(Card)({
  flexDirection: 'row',
  width: '100%',
  paddingLeft: 33,
  paddingTop: 24,
  paddingRight: 33,
  paddingBottom: 24,
  marginTop: 16,
});

const StatView = styled.View({
  width: '50%',
});

const StatLabel = styled.Text({
  fontFamily: 'Roboto',
  fontWeight: '500',
  fontSize: 13,
  lineHeight: 15,
  letterSpacing: 2,
  color: '#565656',
  textTransform: 'uppercase',
});

const StatValue = styled.Text(({theme}) => ({
  fontFamily: 'Roboto',
  fontWeight: 500,
  fontSize: 42,
  lineHeight: 48,
  marginTop: 9,
  color: theme.colors.text,
}));

const PercentageValue = styled.Text(({theme}) => ({
  fontFamily: 'Roboto',
  fontWeight: '500',
  fontSize: 15,
  lineHeight: 18,
  textAlign: 'right',
  letterSpacing: 2,
  color: theme.colors.text,
}));

const CaloriesCircle = styled.View({
  width: 65,
  height: 65,
  borderRadius: 35,
  background: 'rgba(150, 150, 150, 0.1)',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
});

const Calories = styled.Text(({theme}) => ({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: 18,
  lineHeight: 21,
  textAlign: 'center',
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: theme.colors.text,
}));

const StatChart = styled.Image({
  marginTop: 8,
});

const FeedContainer = styled.View({});

const ListFooterContainer = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
});

const StatNumber = ({value}: {value: string}) => {
  return <StatValue>{value}</StatValue>;
};

export const Feed = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {colors} = useTheme();

  const {openModal, closeModal} = useModal();

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  // Preload providers
  useProviders();

  // Update intercom on user change
  useUpdateIntercomUser();

  const {data: user} = useMe({
    refetchOnMount: false,
    refetchInterval: 10000,
  });

  const {data: goals} = useGoals({
    refetchOnMount: false,
    refetchInterval: 10000,
  });

  const {data: nextReward, isFetched: isNextRewardFetched} = useNextReward({
    refetchOnMount: false,
    refetchInterval: 10000,
  });

  const feedPreferences = useSelector(memoSelectFeedPreferences);

  const {
    data: feed,
    refetch: refetchFeed,
    isLoading: isFeedLoading,
    fetchNextPage: fetchFeedNextPage,
    isFetchingNextPage: isFeedFetchingNextPage,
    isFetchedAfterMount: isFeedFetchedAfterMount,
    isRefetching: isRefetchingFeed,
    error: feedError,
  } = useFeed({
    my_goals: feedPreferences.showGoals,
    friends_activities: feedPreferences.showFriends,
    my_updates: feedPreferences.showUpdates,
  });

  const [isPulledDown, setIsPulledDown] = useState(false);

  const feedErrorMessage = feedError
    ? getErrorMessage(feedError as any)
    : undefined;

  const feedResults = getResultsFromPages<FeedItemType>(feed);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetchFeed();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    promptNewsletterModal();
  }, [user]);

  useEffect(() => {
    queryClient.removeQueries(QueryKeys.Feed);
    refetchFeed();
  }, [feedPreferences]);

  useEffect(() => {
    saveCurrentToken();
  }, []);

  const promptNewsletterModal = async () => {
    const newsletterKey = 'NEWSLETTER_PROMPTED';
    const wasNewsletterModalShown = await getPersistedData(newsletterKey);

    if (
      !wasNewsletterModalShown &&
      !user?.settings?.newsletter_subscriptions_user &&
      !!user
    ) {
      await persistData(newsletterKey, 'true');

      openModal(id => {
        return (
          <Modal title={'Newsletter'}>
            <NewsletterModal
              {...{user}}
              onCloseCallback={() => {
                closeModal(id);
              }}
            />
          </Modal>
        );
      });
    }
  };

  if (!user) return null;

  const keyExtractor = (item: FeedItemType) => item.id as string;

  const renderItem = ({item}: {item: FeedItemType}) => {
    const isLiked = !!(item.likes as UserPublic[]).find(
      (feedItemUser: any) => feedItemUser.id === user?.id,
    );

    return (
      <FeedItem item={item} unitSystem={user.unit_system} isLiked={isLiked} />
    );
  };

  const ListFooterComponent = isFeedFetchingNextPage ? (
    <ListFooterContainer style={{height: 72}}>
      <ActivityIndicator color={colors.accent} />
    </ListFooterContainer>
  ) : null;

  // const ListEmptyComponent = () => {
  //   if (isFeedLoading || !isFeedFetchedAfterMount) {
  //     return (
  //       <View
  //         style={{
  //           flex: 1,
  //           justifyContent: 'center',
  //           alignItems: 'center',
  //         }}>
  //         <ActivityIndicator color={colors.accent} />
  //       </View>
  //     );
  //   }

  //   return (
  //     <View style={{paddingTop: 10}}>
  //       {feedErrorMessage ? (
  //         <>
  //           <Label
  //             type="body"
  //             appearance={'accentSecondary'}
  //             style={{textAlign: 'center'}}>
  //             {feedErrorMessage}
  //           </Label>
  //         </>
  //       ) : (
  //         <>
  //           <Label
  //             type="body"
  //             appearance={'accentSecondary'}
  //             style={{textAlign: 'center', paddingHorizontal: 20}}>
  //             Let’s get your feed looking top notch. Start filling it up by
  //             smashing some goals, following{' '}
  //             <Label onPress={() => navigation.navigate('Friends')}>
  //               Friends
  //             </Label>{' '}
  //             or participating in{' '}
  //             <Label onPress={() => navigation.navigate('Leagues')}>
  //               Leagues
  //             </Label>
  //             .
  //           </Label>
  //         </>
  //       )}
  //     </View>
  //   );
  // };

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <FlatList
        // {...{renderItem, ListFooterComponent, ListEmptyComponent, keyExtractor}}
        {...{renderItem, ListFooterComponent, keyExtractor}}
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
          <>
            <HeaderContainer>
              <TopButtonRow>
                {/* <NotificationsButton count={user.unread_notifications} /> */}
                <NotificationsButton
                  source={require('../../../assets/images/icon/bell.png')}
                  onPress={() => {
                    navigation.navigate('Notifications');
                  }}
                />

                <TopButtonSpacer />

                {/* <SettingsButton
                  onPress={() => {
                    navigation.navigate('Settings');
                  }}
                /> */}
                <SettingsButton
                  source={require('../../../assets/images/icon/sliders.png')}
                />
              </TopButtonRow>

              <HeaderWidgetContainer style={{marginBottom: 5}}>
                <UserWidget
                  goalProgress={goals ? calculateGoalsPercentage(goals) : 0}
                  name={user.name}
                  rank={user.rank}
                  avatar={user.avatar?.url_512x512}
                  friendCount={user.following_total}
                  followerCount={user.followers_total}
                  pointCount={user.points_total}
                />
              </HeaderWidgetContainer>

              <HeaderWidgetContainer>
                <GoalTracker
                  isLocalUser={true}
                  trackers={[
                    {
                      supportedProviders: [
                        ProviderType.GoogleFit,
                        ProviderType.AppleHealthkit,
                        ProviderType.Fitbit,
                      ],
                      identifier: 'steps',
                      goal: {
                        value: goals?.current_steps || 0,
                        target: goals?.target_steps || 0,
                      },
                      icon: 'steps',
                    },
                    {
                      supportedProviders: [
                        ProviderType.GoogleFit,
                        ProviderType.AppleHealthkit,
                      ],
                      identifier: 'mindfulness',
                      goal: {
                        value: goals?.current_mindfulness_minutes || 0,
                        target: goals?.target_mindfulness_minutes || 0,
                      },
                      icon: 'yoga',
                    },
                    {
                      supportedProviders: [
                        ProviderType.GoogleFit,
                        ProviderType.AppleHealthkit,
                      ],
                      identifier: 'water',
                      goal: {
                        value: goals?.current_water_litres || 0,
                        target: goals?.target_water_litres || 0,
                      },
                      icon: 'water',
                    },
                    {
                      supportedProviders: [
                        ProviderType.AppleHealthkit,
                        ProviderType.Fitbit,
                      ],
                      identifier: 'sleep',
                      goal: {
                        value: goals?.current_sleep_hours || 0,
                        target: goals?.target_sleep_hours || 0,
                      },
                      icon: 'sleep',
                    },
                    {
                      supportedProviders: [
                        ProviderType.GoogleFit,
                        ProviderType.AppleHealthkit,
                      ],
                      identifier: 'active_minutes',
                      goal: {
                        value: goals?.current_active_minutes || 0,
                        target: goals?.target_active_minutes || 0,
                      },
                      icon: 'stopwatch',
                    },
                    {
                      supportedProviders: [
                        ProviderType.GoogleFit,
                        ProviderType.AppleHealthkit,
                        ProviderType.Fitbit,
                      ],
                      identifier: 'floors',
                      goal: {
                        value: goals?.current_floors_climbed || 0,
                        target: goals?.target_floors_climbed || 0,
                      },
                      icon: 'stairs',
                    },
                  ]}
                />
              </HeaderWidgetContainer>

              {/* {!!nextReward?.reward && isNextRewardFetched && (
                <HeaderWidgetContainer>
                  <RewardTracker
                    points={user.points_total}
                    targetPoints={nextReward?.reward.points_required || 0}
                    isLoading={!isNextRewardFetched}
                    claimableRewardsCount={
                      nextReward?.unclaimed_rewards_total || 0
                    }
                    onPress={() => navigation.navigate('Rewards')}
                  />
                </HeaderWidgetContainer>
              )} */}
            </HeaderContainer>

            <StatContainer>
              {/* <FeedFilter /> */}
              <StatCard>
                <StatView>
                  <StatLabel>total $bfit</StatLabel>
                  <StatNumber value={'00640'} />
                </StatView>
                <StatView
                  style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <View>
                    <PercentageValue>+23%</PercentageValue>
                    <StatChart
                      source={require('../../../assets/images/total_bfit_chart.png')}
                    />
                  </View>
                </StatView>
              </StatCard>
              <StatCard>
                <StatView>
                  <StatLabel>total calories</StatLabel>
                  <StatNumber value={'01240'} />
                </StatView>
                <StatView
                  style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <ProgressCircle
                    progress={0.87}
                    strokeWidth={3}
                    backgroundStrokeWidth={2.5}
                    bloomIntensity={0.5}
                    bloomRadius={5}
                    size={81}>
                    <CaloriesCircle>
                      <Calories>87%</Calories>
                    </CaloriesCircle>
                  </ProgressCircle>
                </StatView>
              </StatCard>
              <StatCard>
                <StatView>
                  <StatLabel>total rank</StatLabel>
                  <StatNumber value={'37640'} />
                </StatView>
                <StatView
                  style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <View>
                    <PercentageValue>+10P</PercentageValue>
                    <StatChart
                      source={require('../../../assets/images/total_rank_chart.png')}
                    />
                  </View>
                </StatView>
              </StatCard>
            </StatContainer>

            <FeedContainer>
              <CompeteLeagues />
              <UnlockedRewards />
              <ActivityHistory />
              <RoutesClasses />
            </FeedContainer>
          </>
        }
      />
    </Wrapper>
  );
};
