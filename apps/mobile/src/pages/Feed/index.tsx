import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useScrollToTop,
} from '@react-navigation/native';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';

import {GoalTracker, Modal, PlotCard, UserWidget} from '@components';
import {
  useGoals,
  useMe,
  useModal,
  useProviders,
  useUpdateIntercomUser,
  useRewards,
} from '@hooks';
import {calculateGoalsPercentage, getPersistedData, persistData} from '@utils';
import {saveCurrentToken} from '@api';
import {SCREEN_CONTAINER_SPACE} from '@constants';

import {
  NewsletterModal,
  NotificationsButton,
  SettingsButton,
  UserActivityHistory,
  RoutesClasses,
  CompeteLeagues,
} from './components';
import {getResultsFromPages} from 'utils/api';
import {RewardSlider} from '../Rewards/components';
import {BOTTOM_TAB_BAR_HEIGHT} from '../../routes/Home/components';
import theme from '../../theme/themes/fitlink';

const Wrapper = styled.View({
  flex: 1,
});

const TopButtonRow = styled.View({
  top: 10,
  right: 0,
  zIndex: 1,
  marginRight: 20,
  position: 'absolute',
  flexDirection: 'row',
  justifyContent: 'flex-end',
});

const HeaderContainer = styled.View({
  paddingTop: 20,
  paddingHorizontal: 10,
  marginBottom: 10,
});

const StatContainer = styled.View({
  paddingHorizontal: 10,
  marginBottom: SCREEN_CONTAINER_SPACE,
});

export const Feed = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const {openModal, closeModal} = useModal();

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);

  // Preload providers
  useProviders();

  // Update intercom on user change
  useUpdateIntercomUser();

  const {data: user, refetch: refetchUser} = useMe();
  const {data: goals, refetch: refetchGoals} = useGoals();

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

  const refresh = useCallback(async () => {
    try {
      setIsManuallyRefreshing(true);
      await Promise.all([refetchGoals(), refetchUser()]);
    } catch (e) {
      console.warn('refresh', e);
    } finally {
      setIsManuallyRefreshing(false);
    }
  }, [refetchGoals, refetchUser]);

  useFocusEffect(
    useCallback(() => {
      refetchGoals();
    }, [refetchGoals]),
  );

  useEffect(() => {
    promptNewsletterModal();
  }, [promptNewsletterModal]);

  useEffect(() => {
    saveCurrentToken();
  }, []);

  const totalBfitAmount = useMemo(
    () => user?.points_total ?? 0,
    [user?.points_total],
  );

  const navigateToWallet = useCallback(
    () => navigation.navigate('Wallet'),
    [navigation],
  );

  const bfitStyles = useMemo(() => styles.bfit, []);

  if (!user) {
    return null;
  }

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <BottomSheetModalProvider>
        <ScrollView
          refreshControl={
            <RefreshControl
              onRefresh={refresh}
              refreshing={isManuallyRefreshing}
              tintColor={theme.colors.accent}
            />
          }
          contentContainerStyle={{
            paddingBottom: insets.bottom + BOTTOM_TAB_BAR_HEIGHT,
          }}>
          <HeaderContainer style={{paddingTop: 20}}>
            <TopButtonRow>
              <NotificationsButton count={user.unread_notifications} />
              <SettingsButton />
            </TopButtonRow>
            <UserWidget
              goalProgress={goals ? calculateGoalsPercentage(goals) : 0}
              name={user.name}
              rank={user.rank}
              avatar={user.avatar?.url_512x512}
              friendCount={user.following_total}
              followerCount={user.followers_total}
              pointCount={user.points_total}
              containerStyle={{marginBottom: SCREEN_CONTAINER_SPACE}}
            />
            <GoalTracker
              isLocalUser={true}
              containerStyle={{marginBottom: SCREEN_CONTAINER_SPACE - 10}}
            />
          </HeaderContainer>
          <StatContainer>
            <PlotCard.BFIT
              totalAmount={totalBfitAmount}
              gainedPerDay={100}
              percentsPerDay={23.4}
              onPress={navigateToWallet}
              wrapperStyle={bfitStyles}
            />
            <PlotCard.Calories
              totalAmount={355}
              gainedPerDay={123}
              percentsPerDay={45.3}
            />
          </StatContainer>
          <CompeteLeagues
            containerStyle={{marginBottom: SCREEN_CONTAINER_SPACE}}
          />
          <RewardSlider
            data={unlockedRewardsEntries}
            title="Unlocked Rewards"
            isLoading={isFetchingLockedRewards}
            isLoadingNextPage={isFetchingUnLockedRewardsNextPage}
            userPoints={user!.points_total}
            fetchNextPage={fetchUnLockedRewardsNextPage}
            containerStyle={{
              marginBottom: SCREEN_CONTAINER_SPACE - 10 /* card margin */,
            }}
            userBfit={user!.bfit_balance ?? 0}
          />
          <UserActivityHistory
            containerStyle={{marginBottom: SCREEN_CONTAINER_SPACE}}
          />
          <RoutesClasses
            containerStyle={{marginBottom: SCREEN_CONTAINER_SPACE}}
          />
        </ScrollView>
      </BottomSheetModalProvider>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  bfit: {
    marginBottom: 20,
  },
});
