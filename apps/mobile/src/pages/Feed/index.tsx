import {Button, GoalTracker, Icon, RewardTracker} from '@components';
import {useAuth, useMe} from '@hooks';
import {UserWidget} from '@components';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {FlatList, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const Wrapper = styled.View({flex: 1});

const SettingsButtonContainer = styled.View({
  position: 'absolute',
  right: 20,
});

const SettingsButton = styled(Icon).attrs(({theme: {colors}}) => ({
  name: 'gear',
  size: 20,
  color: colors.accentSecondary,
}))({});

const HeaderContainer = styled.View({
  paddingHorizontal: 20,
  marginVertical: 10,
});

const HeaderWidgetContainer = styled.View({marginTop: 10});

export const Feed = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {colors} = useTheme();

  const {logout} = useAuth();

  const {
    data: user,
    isFetching: isFetchingUser,
    refetch: refetchUser,
  } = useMe({
    refetchOnMount: false,
  });

  if (!user) return null;

  // TODO: Add followed_total count to UserWidget once the API provides it

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <FlatList
        style={{overflow: 'visible'}}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={isFetchingUser}
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
                  friendCount={8}
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
                      goal: {value: 3476, target: 7500},
                      icon: 'steps',
                    },
                    {
                      enabled: false,
                      identifier: 'mindfulness',
                      goal: {value: 0, target: 200},
                      icon: 'yoga',
                    },
                    {
                      enabled: false,
                      identifier: 'water',
                      goal: {value: 0, target: 200},
                      icon: 'water',
                    },
                    {
                      enabled: true,
                      identifier: 'sleep',
                      goal: {value: 7.5, target: 8},
                      icon: 'sleep',
                    },
                    {
                      enabled: true,
                      identifier: 'floors',
                      goal: {value: 22, target: 15},
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
                  onPress={() => {
                    // TODO: Navigate to Rewards
                  }}
                />
              </HeaderWidgetContainer>

              <SettingsButtonContainer>
                <SettingsButton
                  onPress={() => {
                    navigation.navigate('Settings');
                  }}
                />
              </SettingsButtonContainer>

              <HeaderWidgetContainer>
                <Button text="Log out" onPress={() => logout()} />
              </HeaderWidgetContainer>

              <HeaderWidgetContainer>
                <Button text="Test hook" onPress={() => refetchUser()} />
              </HeaderWidgetContainer>
            </HeaderContainer>
          </>
        }
        data={[]}
        renderItem={() => null}
      />
    </Wrapper>
  );
};
