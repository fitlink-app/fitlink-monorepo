import {
  FeedFilter,
  FeedItem,
  GoalTracker,
  Icon,
  RewardTracker,
} from '@components';
import {useGoals, useMe} from '@hooks';
import {UserWidget} from '@components';
import React, {useCallback} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {FlatList, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const Wrapper = styled.View({flex: 1});

const TopButtonRow = styled.View({
  position: 'absolute',
  right: 20,
  flexDirection: 'row',
});

const TopButtonSpacer = styled.View({width: 10});

const SettingsButton = styled(Icon).attrs(({theme: {colors}}) => ({
  name: 'gear',
  size: 20,
  color: colors.accentSecondary,
}))({});

const NotificationsButton = styled(Icon).attrs(({theme: {colors}}) => ({
  name: 'bell',
  size: 20,
  color: colors.accentSecondary,
}))({});

const HeaderContainer = styled.View({
  paddingHorizontal: 20,
  marginVertical: 10,
});

const HeaderWidgetContainer = styled.View({marginTop: 10});

const FeedContainer = styled.View({});

export const Feed = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {colors} = useTheme();

  const {data: user, refetch: refetchUser} = useMe({
    refetchOnMount: false,
    refetchInterval: 10000,
  });

  const {data: goals} = useGoals({
    refetchOnMount: false,
    refetchInterval: 10000,
  });

  console.log(goals);

  const onFeedItemPressed = useCallback(() => {
    navigation.navigate('HealthActivityDetails');
  }, []);

  if (!user) return null;

  const renderItem = ({item, index}) => {
    return <FeedItem key={item} onContentPress={onFeedItemPressed} />;
  };

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <FlatList
        {...{renderItem}}
        data={[1, 2, 3, 4, 5, 6]}
        style={{overflow: 'visible'}}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={false}
            onRefresh={refetchUser}
          />
        }
        ListHeaderComponent={
          <>
            <HeaderContainer>
              <HeaderWidgetContainer style={{marginBottom: 5}}>
                <UserWidget
                  name={user.name}
                  rank={'Newbie'}
                  avatar={user.avatar?.url_512x512}
                  friendCount={user.following_total}
                  followerCount={user.followers_total}
                  pointCount={user.points_total}
                />
              </HeaderWidgetContainer>

              <HeaderWidgetContainer>
                <GoalTracker
                  trackers={[
                    {
                      enabled: true,
                      identifier: 'steps',
                      goal: {
                        value: goals?.current_steps || 0,
                        target: goals?.target_steps || 0,
                      },
                      icon: 'steps',
                    },
                    {
                      enabled: true,
                      identifier: 'mindfulness',
                      goal: {
                        value: goals?.current_mindfulness_minutes || 0,
                        target: goals?.target_mindfulness_minutes || 0,
                      },
                      icon: 'yoga',
                    },
                    {
                      enabled: true,
                      identifier: 'water',
                      goal: {
                        value: goals?.current_water_litres || 0,
                        target: goals?.target_water_litres || 0,
                      },
                      icon: 'water',
                    },
                    {
                      enabled: true,
                      identifier: 'sleep',
                      goal: {
                        value: goals?.current_sleep_hours || 0,
                        target: goals?.target_sleep_hours || 0,
                      },
                      icon: 'sleep',
                    },
                    {
                      enabled: true,
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

              <HeaderWidgetContainer>
                <RewardTracker
                  points={177}
                  targetPoints={250}
                  claimableRewardsCount={0}
                  onPress={() => navigation.navigate('Rewards')}
                />
              </HeaderWidgetContainer>

              <TopButtonRow>
                <NotificationsButton
                  onPress={() => {
                    navigation.navigate('Notifications');
                  }}
                />

                <TopButtonSpacer />

                <SettingsButton
                  onPress={() => {
                    navigation.navigate('Settings');
                  }}
                />
              </TopButtonRow>
            </HeaderContainer>

            <FeedContainer>
              <FeedFilter />
            </FeedContainer>
          </>
        }
      />
    </Wrapper>
  );
};
