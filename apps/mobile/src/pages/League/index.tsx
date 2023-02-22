import React, {useEffect, useRef, useState} from 'react';
import {Animated, InteractionManager, Platform, StyleSheet} from 'react-native';
import {RootStackParamList} from 'routes/types';
import styled from 'styled-components/native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Navbar, BfitSpinner} from '@components';
import {useLeague, useLeagueMembers, useLeagueMembersMe, useMe} from '@hooks';

import {Leaderboard} from './components';
import {getResultsFromPages} from '../../utils/api';

const HEADER_HEIGHT = 300;

const Wrapper = styled.View({flex: 1});

export const League = () => {
  const navigation = useNavigation();
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
  } = useLeague(id, areInteractionsDone);

  const {
    isFetching: isFetchingMembers,
    refetch: refetchMembers,
    fetchNextPage: fetchMoreMembers,
    isFetchingNextPage: isFetchingMembersNextPage,
    isFetchedAfterMount: areMembersFetchedAfterMount,
    data: membersPages,
  } = useLeagueMembers(id);

  const members = getResultsFromPages(membersPages);

  const {data: memberMe, refetch: refetchMemberMe} = useLeagueMembersMe(
    activeLeague?.id,
    activeLeague?.participating,
  );

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
  };

  if (!activeLeague) {
    return (
      <Wrapper>
        <Navbar scrollAnimatedValue={scrollValue} iconColor={'white'} overlay />
        <BfitSpinner wrapperStyle={styles.loadingWrapper} />
      </Wrapper>
    );
  }

  const bFitToClaimRaw = memberMe
    ? memberMe.bfit_earned - memberMe.bfit_claimed
    : 0;

  const onEditPress = () => {
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
  };

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
          userId={user!.id}
          refreshing={isRefreshing}
          onRefresh={refreshLeaderboard}
          onEditPressed={onEditPress}
          onEndReached={() => {
            fetchMoreMembers();
          }}
        />
      </Wrapper>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
