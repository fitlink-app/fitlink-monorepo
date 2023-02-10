import React, {useRef} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Label, PlotCard} from '@components';
import {useMe, useRewards} from '@hooks';
import {RewardSlider} from './components';
import {getResultsFromPages} from 'utils/api';
import {ActivityIndicator, RefreshControl, ScrollView} from 'react-native';
import {useScrollToTop} from '@react-navigation/native';
import {BOTTOM_TAB_BAR_HEIGHT} from '../../routes/Home/components';
import {SCREEN_CONTAINER_SPACE} from '@constants';
import {convertBfitToUsd, getViewBfitValue, widthLize} from '@utils';

const Wrapper = styled.View({flex: 1});

const PageTitle = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'accent',
  bold: true,
}))({
  fontFamily: 'Roboto',
  fontSize: 15,
  lineHeight: 18,
  textTransform: 'uppercase',
  textAlign: 'center',
  marginTop: 12,
  marginBottom: 27,
});

const ActivityIndicatorContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Rewards = () => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const {
    data: user,
    refetch: refetchUser,
    isLoading: isLoadingUser,
    isRefetching: isUserRefreshing,
  } = useMe({
    refetchOnMount: false,
  });

  const {
    data: unlockedRewards,
    isRefetching: isUnlockedRefreshing,
    isLoading: isLoadingUnLockedRewards,
    isFetching: isFetchingUnLockedRewards,
    isFetchingNextPage: isFetchingUnLockedRewardsNextPage,
    fetchNextPage: fetchUnLockedRewardsNextPage,
    refetch: refetchUnLockedRewards,
  } = useRewards({available: true});

  const {
    data: lockedRewards,
    isRefetching: isLockedRefreshing,
    isLoading: isLoadingLockedRewards,
    isFetching: isFetchingLockedRewards,
    isFetchingNextPage: isFetchingLockedRewardsNextPage,
    fetchNextPage: fetchLockedRewardsNextPage,
    refetch: refetchLockedRewards,
  } = useRewards({locked: true});

  const unlockedRewardsEntries = getResultsFromPages(unlockedRewards);
  const lockedRewardsEntries = getResultsFromPages(lockedRewards);

  const isLoadingRewards = isLoadingLockedRewards || isLoadingUnLockedRewards;
  const isRefreshing =
    isUserRefreshing || isUnlockedRefreshing || isLockedRefreshing;

  const bfitViewValue = getViewBfitValue(user?.bfit_balance);
  const totalRewardsCount =
    unlockedRewardsEntries.length + lockedRewardsEntries.length;

  const refetchAllRewards = () =>
    Promise.all([refetchUnLockedRewards(), refetchLockedRewards()]);

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchUser(), refetchAllRewards()]);
    } catch (e) {
      console.warn('handleRefresh', e);
    }
  };

  const LoadingRewardsContent = () => (
    <ActivityIndicatorContainer>
      <ActivityIndicator color={colors.accent} />
    </ActivityIndicatorContainer>
  );

  const EmptyRewardsContent = () => {
    if (isLoadingRewards) {
      return <LoadingRewardsContent />;
    }
    return (
      <Label style={{textAlign: 'center'}}>
        There are no rewards available right now. {'\n'}
        Start racking up those points and enjoying the perks 🙂
      </Label>
    );
  };

  return (
    <Wrapper style={{marginTop: insets.top}}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + BOTTOM_TAB_BAR_HEIGHT + 20,
        }}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior={'never'}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }>
        <PageTitle>REWARDS</PageTitle>
        <PlotCard.BFIT
          totalAmount={bfitViewValue}
          totalAmountAlt={convertBfitToUsd(bfitViewValue)}
          isLoading={isLoadingUser}
          wrapperStyle={{
            marginHorizontal: widthLize(20),
            marginBottom: SCREEN_CONTAINER_SPACE,
          }}
        />
        {!totalRewardsCount ? (
          <EmptyRewardsContent />
        ) : (
          <>
            <RewardSlider
              data={unlockedRewardsEntries}
              title="UNLOCKED"
              isLoading={isFetchingUnLockedRewards && !isRefreshing}
              isLoadingNextPage={isFetchingUnLockedRewardsNextPage}
              userPoints={user!.points_total}
              userBfit={getViewBfitValue(user?.bfit_balance)}
              fetchNextPage={fetchUnLockedRewardsNextPage}
              containerStyle={{
                marginBottom: SCREEN_CONTAINER_SPACE - 10 /* card margin */,
              }}
            />
            <RewardSlider
              data={lockedRewardsEntries}
              title="LOCKED"
              isLoading={isFetchingLockedRewards && !isRefreshing}
              isLoadingNextPage={isFetchingLockedRewardsNextPage}
              userPoints={user!.points_total}
              userBfit={getViewBfitValue(user?.bfit_balance)}
              fetchNextPage={fetchLockedRewardsNextPage}
              LockedShow={true}
            />
          </>
        )}
      </ScrollView>
    </Wrapper>
  );
};
