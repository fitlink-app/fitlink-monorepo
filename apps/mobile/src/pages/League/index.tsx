import {Navbar} from '@components';
import {
  useLeague,
  useLeagueMembers,
  useLeagueMembersMe,
  useMe,
  useRank,
} from '@hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  InteractionManager,
  Platform,
} from 'react-native';
import {RootStackParamList} from 'routes/types';
import styled, {useTheme} from 'styled-components/native';
import {Leaderboard} from './components/Leaderboard';
import {League as LeagueType} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {LeagueAccess} from '@fitlink/api/src/modules/leagues/leagues.constants';
import {useClaimLeagueBfit} from 'hooks/api/leagues/useClaimLeagueBfit';
import {getViewBfitValue} from '@utils';

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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {data: user} = useMe({
    refetchOnMount: false,
  });

  const {league, id} = props.route.params;

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
    data,
  } = useLeagueMembers(id);

  const members = useMemo(() => {
    return data?.pages[0].results || [];
  }, [data]);

  const {data: flanksData, refetch: refetchFlanks} = useRank(id);

  const activeLeague = {...league, ...fetchedLeague} as LeagueType as any;

  const isBfit = activeLeague?.access === LeagueAccess.CompeteToEarn;

  const {data: memberMe, refetch: refetchMemberMe} = useLeagueMembersMe(
    activeLeague.id,
  );

  const {mutateAsync: claimBfit} = useClaimLeagueBfit();

  const scrollValue = useRef(new Animated.Value(0)).current;

  if (Platform.OS === 'android') {
    scrollValue.setOffset(-HEADER_HEIGHT);
  }

  useEffect(() => {
    if (scrollValue) {
      scrollValue.setValue(-HEADER_HEIGHT);
    }
  }, [scrollValue]);

  const handleScroll = (e: any) => {
    const {layoutMeasurement, contentOffset, contentSize} = e;
    const paddingToBottom = 0;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      fetchMoreMembers();
    }
  };

  const refreshLeaderboard = () => {
    refetchLeague();
    refetchMembers();
    refetchFlanks();
    refetchMemberMe();
  };

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

  const bFitToClaim = memberMe
    ? memberMe.bfit_earned - memberMe.bfit_claimed
    : undefined;

  const claimBfitCallback = () => {
    if (memberMe && bFitToClaim && league) {
      claimBfit({id: league.id, dto: {amount: bFitToClaim}});
    }
  };

  return (
    <Wrapper>
      <Leaderboard
        leagueId={id}
        isBfit={isBfit}
        bFitToClaim={getViewBfitValue(bFitToClaim)}
        bFitEarned={getViewBfitValue(memberMe?.bfit_earned)}
        onClaimPressed={claimBfitCallback}
        isPublic={activeLeague.access === LeagueAccess.Public}
        imageUri={activeLeague?.image.url_640x360}
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
        onRefresh={refreshLeaderboard}
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
        onScroll={({nativeEvent}: any) => handleScroll(nativeEvent)}
        scrollEventThrottle={16}
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
      />
    </Wrapper>
  );
};
