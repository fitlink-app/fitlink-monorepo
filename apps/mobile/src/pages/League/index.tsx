import React, {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import styled from 'styled-components/native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';

import {
  useLeague,
  useLeagueMembers,
  useLeagueMembersMe,
  useMe,
  useOnWaitList,
} from '@hooks';

import {RootStackParamList} from 'routes/types';
import {FilterMemberBottomSheet, Leaderboard} from './components';
import {getResultsFromPages} from '../../utils/api';

export const ITEM_HEIGHT = 82;

const Wrapper = styled.View({flex: 1});

export const League = () => {
  const {id} = useRoute<RouteProp<RootStackParamList, 'League'>>().params;

  const [orderMembersBy, setOrderMembersBy] = useState('points');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
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
  } = useLeagueMembers({leagueId: id, orderBy: orderMembersBy});

  const members = getResultsFromPages(membersPages);

  const {data: memberMe, refetch: refetchMemberMe} = useLeagueMembersMe(
    activeLeague?.id,
    activeLeague?.participating,
  );

  const {refetch: refetchIsOnWaitList} = useOnWaitList(id);

  const refreshLeaderboard = () => {
    refetchLeague();
    refetchMembers();
    refetchMemberMe();
    refetchIsOnWaitList();
  };

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
          onFilterMembersPress={() => setIsFilterSheetOpen(true)}
        />
      </Wrapper>
      <FilterMemberBottomSheet
        isOpen={isFilterSheetOpen}
        onApply={values => {
          setOrderMembersBy(values.join(','));
          setIsFilterSheetOpen(false);
        }}
      />
    </BottomSheetModalProvider>
  );
};
