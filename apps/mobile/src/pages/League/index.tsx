import {Navbar} from '@components';
import {useLeague, useLeagueMembers} from '@hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useRef} from 'react';
import {Animated} from 'react-native';
import {RootStackParamList} from 'routes/types';
import styled from 'styled-components/native';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';
import {Header, Leaderboard} from './components';

const HEADER_HEIGHT = 250;

const Wrapper = styled.View({flex: 1});

export const League = (
  props: StackScreenProps<RootStackParamList, 'League'>,
) => {
  const {league, id} = props.route.params;

  const {
    data: fetchedLeague,
    isFetching: isFetchingLeague,
    refetch: refetchLeague,
  } = useLeague(id);

  const {
    data: membersData,
    isFetching: isFetchingMembers,
    refetch: refetchMembers,
  } = useLeagueMembers(id);

  const members = membersData?.pages.reduce<LeaderboardEntry[]>(
    (acc, current) => {
      return [...acc, ...current.results];
    },
    [],
  );

  const activeLeague = fetchedLeague || league;

  if (!activeLeague) return null;

  const scrollValue = useRef(new Animated.Value(0)).current;
  scrollValue.setValue(-HEADER_HEIGHT);

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
        description={activeLeague.description}
        data={members}
        refreshing={isFetchingLeague}
        onRefresh={refetchLeague}
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
        membership={'none'}
        scrollAnimatedValue={scrollValue}
      />
    </Wrapper>
  );
};
