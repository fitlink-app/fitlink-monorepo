import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  InteractionManager,
  Platform,
} from 'react-native';
import {RootStackParamList} from 'routes/types';
import styled, {useTheme} from 'styled-components/native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';

import {getPositiveValueOrZero, getViewBfitValue} from '@utils';
import {Navbar} from '@components';
import {
  useLeague,
  useLeagueMembers,
  useLeagueMembersMe,
  useMe,
  useModal,
} from '@hooks';

import {Leaderboard, TryTomorrowBanner} from './components';
import {useClaimLeagueBfit} from 'hooks/api/leagues/useClaimLeagueBfit';
import {getResultsFromPages} from '../../utils/api';

const HEADER_HEIGHT = 300;

const Wrapper = styled.View({flex: 1});

const LoadingContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const League = () => {
  const {colors} = useTheme();
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

  const {mutateAsync: claimBfit} = useClaimLeagueBfit();
  const {openModal} = useModal();

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
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      </Wrapper>
    );
  }

  const bFitToClaimRaw = memberMe
    ? memberMe.bfit_earned - memberMe.bfit_claimed
    : 0;

  const bFitToClaim = getPositiveValueOrZero(getViewBfitValue(bFitToClaimRaw));

  const claimBfitCallback = () => {
    if (memberMe && bFitToClaimRaw > 0 && activeLeague) {
      claimBfit({id: activeLeague.id, dto: {amount: bFitToClaimRaw}});
    } else if (bFitToClaimRaw === 0) {
      openModal(() => <TryTomorrowBanner />);
    }
  };

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
          bFitToClaim={bFitToClaim}
          onClaimPressed={claimBfitCallback}
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
