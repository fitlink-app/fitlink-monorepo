import {
  GoalTracker,
  Icon,
  Label,
  Navbar,
  NAVBAR_HEIGHT,
  UserWidget,
} from '@components';
import {useFollowUser, useUnfollowUser, useUser} from '@hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {ActivityIndicator, RefreshControl, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {RootStackParamList} from 'routes/types';

const Wrapper = styled.View({
  flex: 1,
});

const ContentContainer = styled(ScrollView).attrs({
  contentContainerStyle: {},
})({
  overflow: 'visible',
});

const HeaderContainer = styled.View({
  paddingHorizontal: 20,
});

const WidgetContainer = styled.View({marginTop: 10});

const FeedHeaderWrapper = styled.View(({theme: {colors}}) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingBottom: 10,
  marginTop: 10,
  borderBottomWidth: 1,
  borderColor: colors.separator,
}));

const LoadingContainer = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

export const Profile = (
  props: StackScreenProps<RootStackParamList, 'Profile'>,
) => {
  const {id} = props.route.params;

  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  const {
    data: user,
    isFetched: isUserFetched,
    refetch: refetchUser,
  } = useUser(id);

  const {mutate: followUser} = useFollowUser();
  const {mutate: unfollowUser} = useUnfollowUser();

  const [isFetchingManually, setIsFetchingManually] = useState(false);

  const handleOnFollowPressed = () => {
    followUser(id);
  };

  const handleOnUnfollowPressed = () => {
    unfollowUser(id);
  };

  const handleOnRefresh = () => {
    setIsFetchingManually(true);
    refetchUser().finally(() => {
      setIsFetchingManually(false);
    });
  };

  const FollowButton = user?.following ? (
    <Icon
      name={'user-minus'}
      size={24}
      color={colors.accentSecondary}
      onPress={handleOnUnfollowPressed}
    />
  ) : (
    <Icon
      name={'user-plus'}
      size={24}
      color={colors.accent}
      onPress={handleOnFollowPressed}
    />
  );

  return (
    <Wrapper>
      {isUserFetched ? (
        <ContentContainer
          refreshControl={
            <RefreshControl
              tintColor={colors.accent}
              refreshing={isFetchingManually}
              onRefresh={handleOnRefresh}
            />
          }
          style={{
            marginTop: NAVBAR_HEIGHT + insets.top,
          }}>
          <HeaderContainer>
            <WidgetContainer>
              <UserWidget
                avatar={user!.avatar?.url_512x512}
                name={user!.name}
                rank={user!.rank}
                friendCount={user!.following_total}
                followerCount={user!.followers_total}
                pointCount={user!.points_total}
              />
            </WidgetContainer>

            <WidgetContainer>
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
            </WidgetContainer>
          </HeaderContainer>

          <WidgetContainer>
            <FeedHeaderWrapper>
              <Label type={'subheading'} appearance={'primary'}>
                Recent Activities
              </Label>
            </FeedHeaderWrapper>
          </WidgetContainer>
        </ContentContainer>
      ) : (
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      )}

      <Navbar
        backButtonLabel={'Back'}
        overlay
        rightComponent={isUserFetched ? FollowButton : undefined}
      />
    </Wrapper>
  );
};
