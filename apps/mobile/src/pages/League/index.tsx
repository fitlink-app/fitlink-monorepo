import {Navbar} from '@components';
import {useLeague, useLeagueMembers, useMe, useRank} from '@hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  InteractionManager,
  Platform,
  View,
} from 'react-native';
import {RootStackParamList} from 'routes/types';
import styled, {useTheme} from 'styled-components/native';
import {Header, Leaderboard} from './components';
import {League as LeagueType} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
const HEADER_HEIGHT = 300;

const Wrapper = styled.View({flex: 1});

const LoadingContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const League = (
  props: StackScreenProps<RootStackParamList, 'League'>,
) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  const {data: user} = useMe({
    refetchOnMount: false,
  });

  const {league, id} = props.route.params;

  const navigation = useNavigation();

  const [areInteractionsDone, setInteractionsDone] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setInteractionsDone(true);
    });
  }, []);

  const {
    data: fetchedLeague,
    isFetching: isFetchingLeague,
    refetch: refetchLeague,
    isFetchedAfterMount: isLeagueFetchedAfterMount,
  } = useLeague(id, areInteractionsDone);

  const {
    isFetching: isFetchingMembers,
    refetch: refetchMembers,
    fetchNextPage: fetchMoreMembers,
    isFetchingNextPage: isFetchingMembersNextPage,
    hasNextPage: membersHasNextPage,
    isFetchedAfterMount: areMembersFetchedAfterMount,
  } = useLeagueMembers(id);

  const {data: flanksData, refetch: refetchFlanks} = useRank(id);

  // const members = membersData?.pages.reduce<LeaderboardEntry[]>(
  //   (acc, current) => {
  //     return [...acc, ...current.results];
  //   },
  //   [],
  // );

  const members = [
    {
      created_at: '2022-11-02T12:50:57.750Z',
      deleted_at: null,
      id: '72e271be-58c2-403a-9f13-865a8b374c5c',
      leaderboard_id: '6a729b99-07ad-48f3-aab1-760ec34006d4',
      league_id: '6b82cf33-dffd-4aca-b314-aae2d73fabac',
      points: 83,
      updated_at: '2022-11-02T12:50:57.750Z',
      user: {
        avatar: null,
        followers_total: 0,
        following_total: 1,
        goal_percentage: 0,
        id: 'ae9ddf09-a959-4bba-abaa-32fdd90eedc0',
        name: 'Robyn Brown',
        points_total: 83,
      },
      user_id: 'ae9ddf09-a959-4bba-abaa-32fdd90eedc0',
      wins: 2,
    },
    {
      created_at: '2022-11-02T12:50:57.750Z',
      deleted_at: null,
      id: '72e271be-58c2-403a-9f13-865a8b374c34',
      leaderboard_id: '6a729b99-07ad-48f3-aab1-760ec34006d4',
      league_id: '6b82cf33-dffd-4aca-b314-aae2d73fabac',
      points: 55,
      updated_at: '2022-11-02T12:50:57.750Z',
      user: {
        avatar: null,
        followers_total: 0,
        following_total: 1,
        goal_percentage: 0,
        id: 'd697f8d7-f78d-496e-bcc3-82a81260ad0f',
        name: 'Annabelle Malkin',
        points_total: 55,
      },
      user_id: 'd697f8d7-f78d-496e-bcc3-82a81260ad0f',
      wins: 4,
    },
    {
      created_at: '2022-11-02T12:50:57.750Z',
      deleted_at: null,
      id: '72e271be-58c2-403a-9f13-865a8b374c12',
      leaderboard_id: '6a729b99-07ad-48f3-aab1-760ec34006d4',
      league_id: '6b82cf33-dffd-4aca-b314-aae2d73fabac',
      points: 54,
      updated_at: '2022-11-02T12:50:57.750Z',
      user: {
        avatar: null,
        followers_total: 0,
        following_total: 1,
        goal_percentage: 0,
        id: '92187a86-b49f-4cce-be38-4498dbbe71f4',
        name: '@Burcu Akinturk',
        points_total: 54,
      },
      user_id: '92187a86-b49f-4cce-be38-4498dbbe71f4',
      wins: 0,
    },
    {
      created_at: '2022-11-02T12:50:57.750Z',
      deleted_at: null,
      id: '72e271be-58c2-403a-9f13-865a8b374c35',
      leaderboard_id: '6a729b99-07ad-48f3-aab1-760ec34006d4',
      league_id: '6b82cf33-dffd-4aca-b314-aae2d73fabac',
      points: 51,
      updated_at: '2022-11-02T12:50:57.750Z',
      user: {
        avatar: null,
        followers_total: 0,
        following_total: 1,
        goal_percentage: 0,
        id: 'ae9ddf09-a959-4bba-abaa-32fdd90eedc0',
        name: 'Mason Burrows',
        points_total: 51,
      },
      user_id: 'ae9ddf09-a959-4bba-abaa-32fdd90eedc0',
      wins: 0,
    },
    {
      created_at: '2022-11-02T12:50:57.750Z',
      deleted_at: null,
      id: '72e271be-58c2-403a-9f13-865a8b374c65',
      leaderboard_id: '6a729b99-07ad-48f3-aab1-760ec34006d4',
      league_id: '6b82cf33-dffd-4aca-b314-aae2d73fabac',
      points: 50,
      updated_at: '2022-11-02T12:50:57.750Z',
      user: {
        avatar: null,
        followers_total: 0,
        following_total: 1,
        goal_percentage: 0,
        id: 'ae9ddf09-a959-4bba-abaa-32fdd90eedc0',
        name: 'Shreya Parrish',
        points_total: 50,
      },
      user_id: 'ae9ddf09-a959-4bba-abaa-32fdd90eedc0',
      wins: 2,
    },
  ];

  const activeLeague = {...league, ...fetchedLeague} as LeagueType as any;

  const scrollValue = useRef(new Animated.Value(0)).current;

  if (Platform.OS === 'android') {
    scrollValue.setOffset(-HEADER_HEIGHT);
  }

  useEffect(() => {
    if (scrollValue) {
      scrollValue.setValue(-HEADER_HEIGHT);
    }
  }, [scrollValue]);

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollValue}}}],
    {
      useNativeDriver: true,
    },
  );

  if (!Object.keys(activeLeague).length) {
    return (
      <Wrapper>
        <Navbar scrollAnimatedValue={scrollValue} iconColor={'white'} overlay />
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      </Wrapper>
    );
  }

  const renderHeader = () => (
    <Header
      height={HEADER_HEIGHT}
      leagueId={id}
      headerImage={activeLeague?.image.url_640x360}
      onEditPressed={() => {
        navigation.navigate('LeagueForm', {
          data: {
            id,
            dto: {
              name: activeLeague.name,
              description: activeLeague.description,
              duration: activeLeague.duration,
              repeat: activeLeague.repeat,
              sportId: activeLeague.sport.id,
            },
            imageUrl: activeLeague.image.url_640x360,
          },
        });
      }}
      membership={
        activeLeague.participating
          ? activeLeague.is_owner
            ? 'owner'
            : 'member'
          : 'none'
      }
      scrollAnimatedValue={scrollValue}
    />
  );

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingBottom: 20,
        flex: 1,
      }}>
      <Wrapper>
        {renderHeader()}
        <Leaderboard
          // renderHeader={renderHeader()}
          fetchingNextPage={isFetchingMembersNextPage}
          isRepeat={activeLeague.repeat}
          title={activeLeague.name}
          memberCount={activeLeague.participants_total}
          endDate={activeLeague.ends_at}
          hasNextPage={!!membersHasNextPage}
          fetchNextPage={() => membersHasNextPage && fetchMoreMembers()}
          isLoaded={areMembersFetchedAfterMount || !!members?.length}
          description={activeLeague.description}
          // @ts-ignore
          data={members}
          flanksData={[...(flanksData?.results || [])].reverse()}
          userId={user!.id}
          refreshing={
            (isFetchingLeague && isLeagueFetchedAfterMount) ||
            (isFetchingMembers &&
              areMembersFetchedAfterMount &&
              !isFetchingMembersNextPage)
          }
          onRefresh={() => {
            refetchLeague();
            refetchMembers();
            refetchFlanks();
          }}
          membership={
            activeLeague.participating
              ? activeLeague.is_owner
                ? 'owner'
                : 'member'
              : 'none'
          }
          style={{flex: 1}}
          contentContainerStyle={{
            paddingBottom: insets.bottom,
            paddingTop: Platform.OS === 'ios' ? 20 : HEADER_HEIGHT + 20,
          }}
          contentInset={{top: HEADER_HEIGHT}}
          contentOffset={{x: 0, y: -HEADER_HEIGHT}}
          automaticallyAdjustContentInsets={false}
          initialNumToRender={25}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      </Wrapper>
    </View>
  );
};
