import React, {useCallback, useEffect, useRef} from 'react';
import {GoalTracker, Modal, PlotCard} from '@components';
import {
  useGoals,
  useMe,
  useModal,
  useProviders,
  useUpdateIntercomUser,
  useRewards,
} from '@hooks';
import {UserWidget, TouchHandler} from '@components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {ScrollView, StyleSheet} from 'react-native';
import {useNavigation, useScrollToTop} from '@react-navigation/native';
import {calculateGoalsPercentage, getPersistedData, persistData} from '@utils';
import {NewsletterModal, NotificationsButton} from './components';
import {getResultsFromPages} from 'utils/api';
import {saveCurrentToken} from '@api';
import {CompeteLeagues} from './components/CompeteLeagues';
import {RewardSlider} from '../Rewards/components';
import {ActivityHistory} from './components/ActivityHistory';
import {RoutesClasses} from './components/RoutesClasses';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {BOTTOM_TAB_BAR_HEIGHT} from '../../routes/Home/components';
import {FEED_CONTAINER_SPACE} from './constants';

const Wrapper = styled.View({
  flex: 1,
});

const TopButtonRow = styled.View({
  position: 'absolute',
  right: 0,
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginRight: 20,
});

const TopButtonSpacer = styled.View({width: 10});

const SettingsButton = styled.Image({});

const HeaderContainer = styled.View({
  paddingTop: 20,
  paddingHorizontal: 10,
  marginBottom: 10,
});

const StatContainer = styled.View({
  paddingHorizontal: 10,
  marginBottom: FEED_CONTAINER_SPACE,
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

  const {data: user} = useMe();

  const {data: goals} = useGoals();

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
      <BottomSheetModalProvider>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + BOTTOM_TAB_BAR_HEIGHT,
          }}>
          <>
            <HeaderContainer style={{paddingTop: 20}}>
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
              <UserWidget
                goalProgress={goals ? calculateGoalsPercentage(goals) : 0}
                name={user.name}
                rank={user.rank}
                avatar={user.avatar?.url_512x512}
                friendCount={user.following_total}
                followerCount={user.followers_total}
                pointCount={user.points_total}
                containerStyle={{marginBottom: FEED_CONTAINER_SPACE}}
              />
              <GoalTracker
                isLocalUser={true}
                containerStyle={{marginBottom: FEED_CONTAINER_SPACE}}
              />
            </HeaderContainer>
            <StatContainer>
              <PlotCard.BFIT
                totalAmount={user.points_total ?? 0}
                gainedPerDay={100}
                percentsPerDay={23.4}
                onPress={() => navigation.navigate('Wallet')}
                wrapperStyle={styles.bfit}
              />
              <PlotCard.Calories
                totalAmount={355}
                gainedPerDay={123}
                percentsPerDay={45.3}
              />
            </StatContainer>
            <CompeteLeagues
              containerStyle={{marginBottom: FEED_CONTAINER_SPACE}}
            />
            <RewardSlider
              data={unlockedRewardsEntries}
              title="Unlocked Rewards"
              isLoading={isFetchingLockedRewards}
              isLoadingNextPage={isFetchingUnLockedRewardsNextPage}
              userPoints={user!.points_total}
              fetchNextPage={fetchUnLockedRewardsNextPage}
              containerStyle={{marginBottom: FEED_CONTAINER_SPACE}}
            />
            <ActivityHistory
              containerStyle={{marginBottom: FEED_CONTAINER_SPACE}}
            />
            <RoutesClasses
              containerStyle={{marginBottom: FEED_CONTAINER_SPACE}}
            />
          </>
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
