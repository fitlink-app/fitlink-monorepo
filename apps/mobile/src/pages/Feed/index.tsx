import React, {useCallback, useEffect, useRef} from 'react';
import {GoalTracker, Modal, RewardTracker} from '@components';
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
import {ScrollView} from 'react-native';
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

const Wrapper = styled.View({
  flex: 1,
});

const TopButtonRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginBottom: -10,
});

const TopButtonSpacer = styled.View({width: 10});

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
          </FeedContainer>
        </>
      </ScrollView>
    </Wrapper>
  );
};
