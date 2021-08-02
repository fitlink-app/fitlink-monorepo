import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Label, RewardTracker} from '@components';
import {useMe, useMyRewards, useRewards} from '@hooks';
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

  const {data: user, isFetched: userIsFetched} = useMe({
    refetchOnMount: false,
  });

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

  // Count of all rewards (owned, unlocked, locked, expired)
  // TODO: Add other reward types once API supports it
  const totalRewardsCount = [
    ...myRewardsEntries,
    ...unclaimedRewardEntries,
    ...lockedRewardsEntries,
    ...expiredRewardsEntries,
  ].length;

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
    userIsFetched;

  const pointsTotal = user?.points_total;
  const claimableRewardsCount = unclaimedRewards?.pages[0]?.total || 0;
  const nextRewardPoint = 500;

  // Refetch all reward lists
  const handleRefresh = () => {
    refetchUnclaimedRewards();
  };

  const renderEmpty = () => {
    if (!isFetchedAfterMount)
      return (
        <ActivityIndicatorContainer>
          <ActivityIndicator color={colors.accent} />
        </ActivityIndicatorContainer>
      );

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
          refreshing={isLoading && isFetchedAfterMount}
          onRefresh={handleRefresh}
        />
      }>
      <ListHeaderContainer>
        <PointsLabelContainer>
          <Label appearance={'primary'}>
            Your point balance is{' '}
            <Label appearance={'accent'}>{pointsTotal}</Label>
          </Label>
        </PointsLabelContainer>

        <RewardTracker
          points={pointsTotal}
          targetPoints={nextRewardPoint}
          claimableRewardsCount={claimableRewardsCount}
          showNextReward={true}
        />
      </ListHeaderContainer>

      {!totalRewardsCount ? (
        renderEmpty()
      ) : (
        <>
          <RewardSlider data={myRewardsEntries} title={'My Rewards'} />
          <RewardSlider
            data={unclaimedRewardEntries}
            title={'Unclaimed Rewards'}
          />
          <RewardSlider data={lockedRewardsEntries} title={'Locked Rewards'} />
          <RewardSlider
            data={expiredRewardsEntries}
            title={'Expired Rewards'}
          />
        </>
      )}
    </Wrapper>
  );
};
