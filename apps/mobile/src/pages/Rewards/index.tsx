import React, {useEffect, useRef, useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Label, PlotCard} from '@components';
import {useMe, useNextReward, useRewards} from '@hooks';
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

  const unlockedRewardsEntries = getResultsFromPages(unlockedRewards);
  const lockedRewardsEntries = getResultsFromPages(lockedRewards);

  // Whether any of the reward list calls are loading
  const isLoading = isFetchingUnLockedRewards || isFetchingLockedRewards;

  const isFetchedAfterMount =
    isUnLockedRewardsFetchedAfterMount &&
    isLockedRewardsFetchedAfterMount &&
    userIsFetchedAfterMount &&
    nextRewardIsFetchedAfterMount;

  const totalRewardsCount =
    unlockedRewardsEntries.length + lockedRewardsEntries.length;

  useEffect(() => {
    if (user?.points_total) {
      Promise.all([refetchNextReward(), refetchAllRewards()]);
    }
  }, [user?.points_total]);

  const refetchAllRewards = () =>
    Promise.all([refetchUnLockedRewards(), refetchLockedRewards()]);

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
                <PageTitle>REWARDS</PageTitle>
              </PageTitleContainer>

              {(!!nextReward?.reward?.points_required ||
                !!nextReward?.unclaimed_rewards_total) && (
                <PlotCard.BFIT
                  totalAmount={user?.points_total ?? 0}
                  gainedPerDay={100}
                  percentsPerDay={23.4}
                />
              )}
            </ListHeaderContainer>

            {!totalRewardsCount ? (
              renderEmpty()
            ) : (
              <>
                <RewardSlider
                  data={unlockedRewardsEntries}
                  title="UNLOCKED"
                  isLoading={isFetchingUnLockedRewards && !isManualRefresh}
                  isLoadingNextPage={isFetchingUnLockedRewardsNextPage}
                  userPoints={user!.points_total}
                  fetchNextPage={fetchUnLockedRewardsNextPage}
                />
                <RewardSlider
                  data={lockedRewardsEntries}
                  title="LOCKED"
                  isLoading={isFetchingLockedRewards && !isManualRefresh}
                  isLoadingNextPage={isFetchingLockedRewardsNextPage}
                  userPoints={user!.points_total}
                  fetchNextPage={fetchLockedRewardsNextPage}
                  LockedShow={true}
                />
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
