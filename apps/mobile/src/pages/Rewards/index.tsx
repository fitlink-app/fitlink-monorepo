import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Label, RewardTracker} from '@components';
import {useRewards} from '@hooks';
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

  const {
    data: rewardsData,
    isFetching: isFetchingRewards,
    isFetchingNextPage: isFetchingRewardsNextPage,
    isFetchedAfterMount: isRewardsFetchedAfterMount,
    fetchNextPage: fetchNextRewardsPage,
    refetch: refetchRewards,
  } = useRewards(['placeholder_param']);

  const rewards = getResultsFromPages(rewardsData);

  // Count of all rewards (owned, unlocked, locked, expired)
  // TODO: Add other reward types once API supports it
  const totalRewardsCount = [...rewards].length;

  // Whether any of the reward list calls are loading
  const isLoading = isFetchingRewards;
  const isFetchedAfterMount = isRewardsFetchedAfterMount;

  const pointsTotal = 127;
  const claimableRewardsCount = 0;
  const nextRewardPoint = 150;

  // Refetch all reward lists
  const handleRefresh = () => {
    refetchRewards();
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
          <RewardSlider data={rewards} title={'My Rewards'} />
          <RewardSlider data={rewards} title={'Unclaimed Rewards'} />
          <RewardSlider data={rewards} title={'Locked Rewards'} />
          <RewardSlider data={[]} title={'Expired Rewards'} />
        </>
      )}
    </Wrapper>
  );
};
