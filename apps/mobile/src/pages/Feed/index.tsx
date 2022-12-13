import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FeedItem, GoalTracker, Modal, RewardTracker} from '@components';
import {
  useGoals,
  useMe,
  useModal,
  useNextReward,
  useProviders,
  useUpdateIntercomUser,
  useRewards,
} from '@hooks';
import {UserWidget, TouchHandler} from '@components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {FlatList, Platform, RefreshControl, ScrollView} from 'react-native';
import {useNavigation, useScrollToTop} from '@react-navigation/native';
import {calculateGoalsPercentage, getPersistedData, persistData} from '@utils';
import {NewsletterModal, NotificationsButton} from './components';
import {getResultsFromPages} from 'utils/api';
import {saveCurrentToken} from '@api';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {CompeteLeagues} from './components/CompeteLeagues';
import {RewardSlider} from '../Rewards/components';
import {ActivityHistory} from './components/ActivityHistory';
import {RoutesClasses} from './components/RoutesClasses';
import {RankCard} from '../Leagues/components/RankCard';
import {CaloriesCard} from './components/CaloriesCard';
import {Label} from '../../components/common';
import {FeedItem as FeedItemType} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useFeed} from '@hooks';
import {useSelector} from 'react-redux';
import {memoSelectFeedPreferences} from 'redux/feedPreferences/feedPreferencesSlice';
import {useTheme} from 'styled-components/native';
import {queryClient, QueryKeys} from '@query';

const Wrapper = styled.View({
  flex: 1,
});

const TopButtonRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginBottom: -10,
});

const TopButtonSpacer = styled.View({width: 10});

const ButtonContainer = styled.View(({theme: {colors}}) => ({
  flexDirection: 'row',
  height: 32,
  backgroundColor: colors.surface,
  borderRadius: 16,
  alignItems: 'center',
  width: 100,
}));

const SettingsButton = styled.Image({});

const HeaderContainer = styled.View({
  paddingHorizontal: 10,
  marginVertical: 10,
});

const HeaderWidgetContainer = styled.View({marginTop: 10});

const StatContainer = styled.View({
  paddingHorizontal: 10,
});

const FeedContainer = styled.View({});

const ListFooterContainer = styled.View({
  paddingLeft: 20,
  paddingRight: 20,
  flex: 1,
  alignItems: 'center',
});

const Button = styled(TouchHandler)({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

export const Feed = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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

  const {
    data: unlockedRewards,
    isFetching: isFetchingLockedRewards,
    isFetchingNextPage: isFetchingUnLockedRewardsNextPage,
    fetchNextPage: fetchUnLockedRewardsNextPage,
  } = useRewards({locked: false});

  const unlockedRewardsEntries = getResultsFromPages(unlockedRewards);

  const promptNewsletterModal = useCallback(async () => {
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
  }, [closeModal, openModal, user]);

  useEffect(() => {
    promptNewsletterModal();
  }, [promptNewsletterModal]);

  useEffect(() => {
    saveCurrentToken();
  }, []);

  const [isPulledDown, setIsPulledDown] = useState(false);
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
  const feedResults = getResultsFromPages<FeedItemType>(feed);
  const {colors} = useTheme();
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
      <FeedItem
        item={item}
        // @ts-ignore
        unitSystem={user?.unit_system}
        isLiked={isLiked}
      />
    );
  };

  if (!user) {
    return null;
  }

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 44 + 79,
        }}>
        <>
          <HeaderContainer>
            <TopButtonRow>
              <NotificationsButton count={user.unread_notifications} />
              <TopButtonSpacer />
              <TouchHandler
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                onPress={() => {
                  navigation.navigate('Settings');
                }}>
                <SettingsButton
                  source={require('../../../assets/images/icon/sliders.png')}
                />
              </TouchHandler>
            </TopButtonRow>

            <HeaderWidgetContainer style={{marginBottom: 5}}>
              <UserWidget
                goalProgress={goals ? calculateGoalsPercentage(goals) : 0}
                name={user.name}
                rank={'Bronze member'}
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
          </HeaderContainer>

          <StatContainer>
            <HeaderWidgetContainer>
              <RewardTracker
                points={user.points_total || 0}
                targetPoints={nextReward?.reward.points_required || 0}
                isLoading={!isNextRewardFetched}
                claimableRewardsCount={nextReward?.unclaimed_rewards_total || 0}
                onPress={() => navigation.navigate('Wallet')}
              />
            </HeaderWidgetContainer>
            <CaloriesCard />
            <RankCard />
          </StatContainer>

          <FeedContainer>
            <FlatList
              {...{renderItem, keyExtractor}}
              ref={scrollRef}
              data={feedResults}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                minHeight: '100%',
                paddingBottom:
                  Platform.OS === 'ios' ? 0 : isFeedFetchingNextPage ? 0 : 72,
              }}
              // onEndReachedThreshold={0.2}
              // onEndReached={() => fetchFeedNextPage()}
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
                  <CompeteLeagues />
                  <RewardSlider
                    data={unlockedRewardsEntries}
                    title={'Unlocked Rewards'}
                    isLoading={isFetchingLockedRewards}
                    isLoadingNextPage={isFetchingUnLockedRewardsNextPage}
                    userPoints={user!.points_total}
                    fetchNextPage={fetchUnLockedRewardsNextPage}
                  />
                  <ActivityHistory />
                  <RoutesClasses />
                </>
              }
              ListFooterComponent={
                feedResults.length > 0 ? (
                  <ListFooterContainer>
                    <ButtonContainer>
                      <Button onPress={() => fetchFeedNextPage()}>
                        <Label type="caption" appearance={'primary'}>
                          SEE MORE
                        </Label>
                      </Button>
                    </ButtonContainer>
                  </ListFooterContainer>
                ) : null
              }
              // ListHeaderComponent={
              //   <CoverImage>
              //     <CoverBackgroundImage
              //       source={require('../../../assets/images/activity_feed/cover-1.png')}
              //     />
              //     <CoverInfo style={{marginTop: 137}}>
              //       <CoverTitle
              //         style={{
              //           fontFamily: 'Roboto',
              //           fontSize: 22,
              //           fontWeight: '500',
              //           lineHeight: 26,
              //         }}>
              //         10-minute Mindfulness Exercises You Can Do
              //       </CoverTitle>
              //       <CoverDate
              //         style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
              //         <Label
              //           type="caption"
              //           style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
              //           Fitlink
              //         </Label>{' '}
              //         - Tuesday at 9:28 AM
              //       </CoverDate>
              //     </CoverInfo>
              //   </CoverImage>
              // }
              // ListFooterComponent={
              //   <ListFooterContainer>
              //     <CoverImage>
              //       <CoverBackgroundImage
              //         source={require('../../../assets/images/activity_feed/cover-2.png')}
              //       />
              //       <CoverInfo style={{marginTop: 113}}>
              //         <CoverTitle
              //           style={{
              //             fontFamily: 'Roboto',
              //             fontSize: 22,
              //             fontWeight: '500',
              //             lineHeight: 26,
              //           }}>
              //           Why Trees Are Good For Our Mental & Physical Wellbeing
              //         </CoverTitle>
              //         <CoverDate
              //           style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
              //           <Label
              //             type="caption"
              //             style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
              //             Fitlink
              //           </Label>{' '}
              //           - Tuesday at 9:28 AM
              //         </CoverDate>
              //       </CoverInfo>
              //     </CoverImage>
              //   </ListFooterContainer>
              // }
            />
          </FeedContainer>
        </>
      </ScrollView>
    </Wrapper>
  );
};
