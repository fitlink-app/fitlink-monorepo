import React, {useEffect, useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Label, RewardTracker} from '@components';
import {useMe, useMyRewards, useNextReward, useRewards} from '@hooks';
import {RewardSlider} from './components';
import {getResultsFromPages} from 'utils/api';
import {ActivityIndicator, RefreshControl} from 'react-native';

const Wrapper = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
})({});

const ListHeaderContainer = styled.View({
  paddingTop: 20,
  paddingHorizontal: 20,
  paddingBottom: 15,
});

const PointsLabelContainer = styled.View({
  alignItems: 'center',
  marginBottom: 10,
});

const ActivityIndicatorContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Rewards = () => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

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
    isFetchingNextPage: isFetchingMyRewardsNextPage,
    isFetchedAfterMount: isMyRewardsFetchedAfterMount,
    fetchNextPage: fetchMyRewardsNextPage,
    refetch: refetchMyRewards,
  } = useMyRewards();

  const {
    data: unclaimedRewards,
    isFetching: isFetchingUnclaimedRewards,
    isFetchingNextPage: isFetchingUnclaimedRewardsNextPage,
    isFetchedAfterMount: isUnclaimedRewardsFetchedAfterMount,
    fetchNextPage: fetchUnclaimedRewardsNextPage,
    refetch: refetchUnclaimedRewards,
  } = useRewards({available: true});

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
    isFetchingNextPage: isFetchingExpiredRewardsNextPage,
    isFetchedAfterMount: isExpiredRewardsFetchedAfterMount,
    fetchNextPage: fetchExpiredRewardsNextPage,
    refetch: refetchExpiredRewards,
  } = useRewards({expired: true});

  const myRewardsEntries = getResultsFromPages(myRewards);
  const unclaimedRewardEntries = getResultsFromPages(unclaimedRewards);
  const lockedRewardsEntries = getResultsFromPages(lockedRewards);
  const expiredRewardsEntries = getResultsFromPages(expiredRewards);

  // Whether any of the reward list calls are loading
  const isLoading =
    isFetchingUnclaimedRewards ||
    isFetchingLockedRewards ||
    isFetchingExpiredRewards ||
    isFetchingMyRewards;

  const isFetchedAfterMount =
    isUnclaimedRewardsFetchedAfterMount &&
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

  const pointsTotal = user?.points_total;
  const claimableRewardsCount = unclaimedRewards?.pages[0]?.total || 0;

  useEffect(() => {
    Promise.all([refetchNextReward(), refetchAllRewards()]);
  }, [user?.points_total]);

  const refetchAllRewards = () =>
    Promise.all([
      refetchMyRewards(),
      refetchUnclaimedRewards(),
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
    if (!isFetchedAfterMount || isLoading) return renderLoading();

    return (
      <Label style={{textAlign: 'center'}}>
        There are no rewards available right now. {'\n'}
        Start racking up those points and enjoying the perks 🙂
      </Label>
    );
  };

  return (
    <Wrapper
      contentContainerStyle={{paddingBottom: 20, flexGrow: 1}}
      contentInset={{top: insets.top, left: 0, bottom: 0, right: 0}}
      contentOffset={{x: 0, y: -insets.top}}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior={'never'}
      refreshControl={
        <RefreshControl
          // progressViewOffset={insets.top}
          tintColor={colors.accent}
          refreshing={isLoading && isFetchedAfterMount && isManualRefresh}
          onRefresh={handleRefresh}
        />
      }>
      {isFetchedAfterMount ? (
        <>
          <ListHeaderContainer>
            <PointsLabelContainer>
              {userIsFetchedAfterMount && (
                <Label appearance={'primary'}>
                  Your point balance is{' '}
                  <Label appearance={'accent'}>{pointsTotal}</Label>
                </Label>
              )}
            </PointsLabelContainer>

            <RewardTracker
              points={user?.points_total || 0}
              targetPoints={nextReward?.reward?.points_required!}
              claimableRewardsCount={claimableRewardsCount}
              showNextReward={true}
            />
          </ListHeaderContainer>

          {!totalRewardsCount ? (
            renderEmpty()
          ) : (
            <>
              <RewardSlider
                data={myRewardsEntries}
                title={'My Rewards'}
                isLoading={isFetchingMyRewards && !isManualRefresh}
                isLoadingNextPage={isFetchingMyRewardsNextPage}
                userPoints={user!.points_total}
                fetchNextPage={fetchMyRewardsNextPage}
              />
              <RewardSlider
                data={unclaimedRewardEntries}
                title={'Unclaimed Rewards'}
                isLoading={isFetchingUnclaimedRewards && !isManualRefresh}
                isLoadingNextPage={isFetchingUnclaimedRewardsNextPage}
                userPoints={user!.points_total}
                fetchNextPage={fetchUnclaimedRewardsNextPage}
              />
              <RewardSlider
                data={lockedRewardsEntries}
                title={'Locked Rewards'}
                isLoading={isFetchingLockedRewards && !isManualRefresh}
                isLoadingNextPage={isFetchingLockedRewardsNextPage}
                userPoints={user!.points_total}
                fetchNextPage={fetchLockedRewardsNextPage}
              />
              <RewardSlider
                data={expiredRewardsEntries}
                title={'Expired Rewards'}
                isLoading={isFetchingExpiredRewards && !isManualRefresh}
                isLoadingNextPage={isFetchingExpiredRewardsNextPage}
                userPoints={user!.points_total}
                fetchNextPage={fetchExpiredRewardsNextPage}
              />
            </>
          )}
        </>
      ) : (
        renderLoading()
      )}
    </Wrapper>
  );
};
