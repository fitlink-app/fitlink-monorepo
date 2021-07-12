import {Navbar} from '@components';
import {useLeague, useLeagueMembers, useMe, useRank} from '@hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import {RootStackParamList} from 'routes/types';
import styled from 'styled-components/native';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';
import {Header, Leaderboard} from './components';
import {League as LeagueType} from '@fitlink/api/src/modules/leagues/entities/league.entity';

const HEADER_HEIGHT = 250;

const Wrapper = styled.View({flex: 1});

export const League = (
  props: StackScreenProps<RootStackParamList, 'League'>,
) => {
  const {data: user} = useMe({
    refetchOnMount: false,
  });

  const {league, id} = props.route.params;

  const {
    data: fetchedLeague,
    isFetching: isFetchingLeague,
    refetch: refetchLeague,
    isFetchedAfterMount: isLeagueFetchedAfterMount,
  } = useLeague(id);

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

  if (!activeLeague) return null;

  const scrollValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scrollValue.setValue(-HEADER_HEIGHT);
  }, []);

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollValue}}}],
    {
      useNativeDriver: true,
    },
  );

  return (
    <Wrapper>
      <Navbar
        scrollAnimatedValue={scrollValue}
        title={league?.name}
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
        title={activeLeague.name}
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
