import React, {useEffect, useRef, useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Label, RewardTracker} from '@components';
import {useMe, useMyRewards, useNextReward, useRewards} from '@hooks';
import {RewardSlider} from './components';
import {getResultsFromPages} from 'utils/api';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {useScrollToTop} from '@react-navigation/native';

const Wrapper = styled.View({});

const ListHeaderContainer = styled.View({
  paddingTop: 20,
  paddingHorizontal: 10,
  paddingBottom: 10,
});

const PageTitleContainer = styled.View({
  alignItems: 'center',
  marginBottom: 21,
});

const PageTitle = styled(Label).attrs(() => ({
  appearance: 'accent',
}))({
  letterSpacing: 1,
  fontSize: 15,
});

const ActivityIndicatorContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Rewards = () => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  // Whether or not display the pull down refresh indicator
  const [isManualRefresh, setManualRefresh] = useState(false);

  const {
    data: user,
    isFetchedAfterMount: userIsFetchedAfterMount,
    refetch: refetchUser,
  } = useMe({
    refetchOnMount: false,
  });

  // TODO: Avoid fetching all the pages when paginated

  const {
    data: nextReward,
    isFetchedAfterMount: nextRewardIsFetchedAfterMount,
    refetch: refetchNextReward,
  } = useNextReward();

  const {
    data: myRewards,
    isFetching: isFetchingMyRewards,
    isFetchedAfterMount: isMyRewardsFetchedAfterMount,
    refetch: refetchMyRewards,
  } = useMyRewards();

  const {
    data: unclaimedRewards,
    isFetching: isFetchingUnclaimedRewards,
    isFetchedAfterMount: isUnclaimedRewardsFetchedAfterMount,
    refetch: refetchUnclaimedRewards,
  } = useRewards({available: true});

  const {
    data: unlockedRewards,
    isFetching: isFetchingUnLockedRewards,
    isFetchingNextPage: isFetchingUnLockedRewardsNextPage,
    isFetchedAfterMount: isUnLockedRewardsFetchedAfterMount,
    fetchNextPage: fetchUnLockedRewardsNextPage,
    refetch: refetchUnLockedRewards,
  } = useRewards({locked: false});

  const {
    data: lockedRewards,
    isFetching: isFetchingLockedRewards,
    isFetchingNextPage: isFetchingLockedRewardsNextPage,
    isFetchedAfterMount: isLockedRewardsFetchedAfterMount,
    fetchNextPage: fetchLockedRewardsNextPage,
    refetch: refetchLockedRewards,
  } = useRewards({locked: true});

  const {
    data: expiredRewards,
    isFetching: isFetchingExpiredRewards,
    isFetchedAfterMount: isExpiredRewardsFetchedAfterMount,
    refetch: refetchExpiredRewards,
  } = useRewards({expired: true});

  const myRewardsEntries = getResultsFromPages(myRewards);
  const unclaimedRewardEntries = getResultsFromPages(unclaimedRewards);
  const unlockedRewardsEntries = getResultsFromPages(unlockedRewards);
  const lockedRewardsEntries = getResultsFromPages(lockedRewards);
  const expiredRewardsEntries = getResultsFromPages(expiredRewards);

  // Whether any of the reward list calls are loading
  const isLoading =
    isFetchingUnclaimedRewards ||
    isFetchingUnLockedRewards ||
    isFetchingLockedRewards ||
    isFetchingExpiredRewards ||
    isFetchingMyRewards;

  const isFetchedAfterMount =
    isUnclaimedRewardsFetchedAfterMount &&
    isUnLockedRewardsFetchedAfterMount &&
    isLockedRewardsFetchedAfterMount &&
    isExpiredRewardsFetchedAfterMount &&
    isMyRewardsFetchedAfterMount &&
    userIsFetchedAfterMount &&
    nextRewardIsFetchedAfterMount;

  const totalRewardsCount = [
    ...myRewardsEntries,
    ...unclaimedRewardEntries,
    ...lockedRewardsEntries,
    ...expiredRewardsEntries,
  ].length;

  useEffect(() => {
    if (user?.points_total) {
      Promise.all([refetchNextReward(), refetchAllRewards()]);
    }
  }, [user?.points_total]);

  const refetchAllRewards = () =>
    Promise.all([
      refetchMyRewards(),
      refetchUnclaimedRewards(),
      refetchUnLockedRewards(),
      refetchLockedRewards(),
      refetchExpiredRewards(),
    ]);

  // Refetch all reward lists
  const handleRefresh = async () => {
    setManualRefresh(true);

    await Promise.all([
      refetchUser(),
      refetchNextReward(),
      refetchAllRewards(),
    ]);

    setManualRefresh(false);
  };

  const renderLoading = () => (
    <ActivityIndicatorContainer>
      <ActivityIndicator color={colors.accent} />
    </ActivityIndicatorContainer>
  );

  const renderEmpty = () => {
    if (!isFetchedAfterMount || isLoading) {
      return renderLoading();
    }

    return (
      <Label style={{textAlign: 'center'}}>
        There are no rewards available right now. {'\n'}
        Start racking up those points and enjoying the perks 🙂
      </Label>
    );
  };

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        style={{height: '100%'}}
        contentContainerStyle={{
          paddingBottom: 44 + 79,
          flexGrow: 1,
          paddingTop: Platform.OS === 'ios' ? 0 : insets.top,
        }}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior={'never'}
        refreshControl={
          <RefreshControl
            progressViewOffset={insets.top + 20}
            tintColor={colors.accent}
            refreshing={isLoading && isFetchedAfterMount && isManualRefresh}
            onRefresh={handleRefresh}
          />
        }>
        {isFetchedAfterMount ? (
          <>
            <ListHeaderContainer>
              <PageTitleContainer>
                <PageTitle>GOLD REWARDS</PageTitle>
              </PageTitleContainer>

              {(!!nextReward?.reward?.points_required ||
                !!nextReward?.unclaimed_rewards_total) && (
                <RewardTracker
                  points={user?.points_total || 0}
                  targetPoints={nextReward?.reward.points_required || 0}
                  claimableRewardsCount={
                    nextReward?.unclaimed_rewards_total || 0
                  }
                  showNextReward={true}
                />
              )}
            </ListHeaderContainer>

            {!totalRewardsCount ? (
              renderEmpty()
            ) : (
              <>
                {/* <RewardSlider
                  data={myRewardsEntries}
                  title={'My Rewards'}
                  isLoading={isFetchingMyRewards && !isManualRefresh}
                  isLoadingNextPage={isFetchingMyRewardsNextPage}
                  userPoints={user!.points_total}
                  fetchNextPage={fetchMyRewardsNextPage}
                /> */}
                {/* <RewardSlider
                  data={unclaimedRewardEntries}
                  title={'Unclaimed Rewards'}
                  isLoading={isFetchingUnclaimedRewards && !isManualRefresh}
                  isLoadingNextPage={isFetchingUnclaimedRewardsNextPage}
                  userPoints={user!.points_total}
                  fetchNextPage={fetchUnclaimedRewardsNextPage}
                /> */}
                <RewardSlider
                  data={unlockedRewardsEntries}
                  title={'UnLocked'}
                  isLoading={isFetchingUnLockedRewards && !isManualRefresh}
                  isLoadingNextPage={isFetchingUnLockedRewardsNextPage}
                  userPoints={user!.points_total}
                  fetchNextPage={fetchUnLockedRewardsNextPage}
                />
                <RewardSlider
                  data={lockedRewardsEntries}
                  title={'Locked'}
                  isLoading={isFetchingLockedRewards && !isManualRefresh}
                  isLoadingNextPage={isFetchingLockedRewardsNextPage}
                  userPoints={user!.points_total}
                  fetchNextPage={fetchLockedRewardsNextPage}
                  LockedShow={true}
                />
                {/* <RewardSlider
                  data={expiredRewardsEntries}
                  title={'Expired Rewards'}
                  isLoading={isFetchingExpiredRewards && !isManualRefresh}
                  isLoadingNextPage={isFetchingExpiredRewardsNextPage}
                  userPoints={user!.points_total}
                  fetchNextPage={fetchExpiredRewardsNextPage}
                /> */}
              </>
            )}
          </>
        ) : (
          renderLoading()
        )}
      </ScrollView>
    </Wrapper>
  );
};
