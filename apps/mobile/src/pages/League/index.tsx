import {Navbar} from '@components';
import {useLeague, useLeagueMembers, useMe, useRank} from '@hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  InteractionManager,
  Platform,
} from 'react-native';
import {RootStackParamList} from 'routes/types';
import styled, {useTheme} from 'styled-components/native';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';
import {Header, Leaderboard} from './components';
import {League as LeagueType} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const HEADER_HEIGHT = 250;

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
    data: membersData,
    isFetching: isFetchingMembers,
    refetch: refetchMembers,
    fetchNextPage: fetchMoreMembers,
    isFetchingNextPage: isFetchingMembersNextPage,
    hasNextPage: membersHasNextPage,
    isFetchedAfterMount: areMembersFetchedAfterMount,
  } = useLeagueMembers(id);

  const {
    data: flanksData,
    refetch: refetchFlanks,
    isFetchedAfterMount: areFlanksFetchedAfterMound,
  } = useRank(id);

  const members = membersData?.pages.reduce<LeaderboardEntry[]>(
    (acc, current) => {
      return [...acc, ...current.results];
    },
    [],
  );

  const activeLeague = {...league, ...fetchedLeague} as LeagueType;

  const scrollValue = useRef(new Animated.Value(0)).current;

  if (Platform.OS === 'android') {
    scrollValue.setOffset(-HEADER_HEIGHT);
  }

  useEffect(() => {
    scrollValue.setValue(-HEADER_HEIGHT);
  }, []);

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollValue}}}],
    {
      useNativeDriver: true,
    },
  );

  if (!Object.keys(activeLeague).length)
    return (
      <Wrapper>
        <Navbar scrollAnimatedValue={scrollValue} iconColor={'white'} overlay />
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      </Wrapper>
    );

  return (
    <Wrapper>
      <Navbar
        scrollAnimatedValue={scrollValue}
        title={activeLeague?.name}
        iconColor={'white'}
        overlay
        titleProps={{
          type: 'title',
          bold: false,
        }}
      />

      <Leaderboard
        fetchingNextPage={isFetchingMembersNextPage}
        isRepeat={activeLeague.repeat}
        endDate={activeLeague.ends_at}
        hasNextPage={!!membersHasNextPage}
        fetchNextPage={() => membersHasNextPage && fetchMoreMembers()}
        isLoaded={areMembersFetchedAfterMount || !!members?.length}
        description={activeLeague.description}
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

      <Header
        height={HEADER_HEIGHT}
        leagueId={id}
        headerImage={activeLeague?.image.url_640x360}
        title={activeLeague.name}
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
        memberCount={activeLeague.participants_total}
        membership={
          activeLeague.participating
            ? activeLeague.is_owner
              ? 'owner'
              : 'member'
            : 'none'
        }
        scrollAnimatedValue={scrollValue}
      />
    </Wrapper>
  );
};
