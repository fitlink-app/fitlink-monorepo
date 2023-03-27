import React, {useEffect, useRef, useState} from 'react';
import {Animated, InteractionManager, Platform} from 'react-native';
import styled from 'styled-components/native';
import {RouteProp, useRoute} from '@react-navigation/native';

import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Navbar} from '@components';
import {useLeague, useLeagueMembers, useLeagueMembersMe, useMe} from '@hooks';

import {RootStackParamList} from 'routes/types';
import {Leaderboard} from './components';
import {getResultsFromPages} from '../../utils/api';
import {useOnWaitList} from './hooks/useInWaitList';

const HEADER_HEIGHT = 300;

export const ITEM_HEIGHT = 82;

const Wrapper = styled.View({flex: 1});

export const League = () => {
  const {id} = useRoute<RouteProp<RootStackParamList, 'League'>>().params;

  const scrollValue = useRef(new Animated.Value(0)).current;

  const [areInteractionsDone, setInteractionsDone] = useState(false);

  const {data: user} = useMe({
    refetchOnMount: false,
  });

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setInteractionsDone(true);
    });
  }, []);

  const {
    data: activeLeague,
    isFetching: isFetchingLeague,
    refetch: refetchLeague,
    isFetchedAfterMount: isLeagueFetchedAfterMount,
    isLoading: isLeagueLoading,
  } = useLeague(id, areInteractionsDone);

  const {
    isFetching: isFetchingMembers,
    refetch: refetchMembers,
    fetchNextPage: fetchMoreMembers,
    isFetchingNextPage: isFetchingMembersNextPage,
    isFetchedAfterMount: areMembersFetchedAfterMount,
    isLoading: isMembersLoading,
    data: membersPages,
  } = useLeagueMembers(id);

  const members = getResultsFromPages(membersPages);

  const {data: memberMe, refetch: refetchMemberMe} = useLeagueMembersMe(
    activeLeague?.id,
    activeLeague?.participating,
  );

  const {refetch: refetchIsOnWaitList} = useOnWaitList(id);

  if (Platform.OS === 'android') {
    scrollValue.setOffset(-HEADER_HEIGHT);
  }

  useEffect(() => {
    if (scrollValue) {
      scrollValue.setValue(-HEADER_HEIGHT);
    }
  }, [scrollValue]);

  const refreshLeaderboard = () => {
    refetchLeague();
    refetchMembers();
    refetchMemberMe();
    refetchIsOnWaitList();
  };

  if (!activeLeague) {
    return (
      <Wrapper>
        <Navbar scrollAnimatedValue={scrollValue} iconColor={'white'} overlay />
      </Wrapper>
    );
  }

  const bFitToClaimRaw = memberMe
    ? memberMe.bfit_earned - memberMe.bfit_claimed
    : 0;

  const isRefreshing =
    (isFetchingLeague && isLeagueFetchedAfterMount) ||
    (isFetchingMembers &&
      areMembersFetchedAfterMount &&
      !isFetchingMembersNextPage);

  return (
    <BottomSheetModalProvider>
      <Wrapper>
        <Leaderboard
          activeLeague={activeLeague}
          bFitToClaimRaw={bFitToClaimRaw}
          data={members}
          isMembersLoading={isMembersLoading}
          isLeagueLoading={isLeagueLoading}
          userId={user!.id}
          refreshing={isRefreshing}
          onRefresh={refreshLeaderboard}
          onEndReached={() => {
            fetchMoreMembers();
          }}
        />
      </Wrapper>
    </BottomSheetModalProvider>
  );
};
