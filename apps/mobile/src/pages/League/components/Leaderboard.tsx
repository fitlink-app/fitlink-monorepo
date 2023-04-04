import React, {useRef, useState} from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  RefreshControl,
  View,
} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useScrollToTop} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/core';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {getViewBfitValue} from '@utils';
import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {LeagueAccess} from '@fitlink/api/src/modules/leagues/leagues.constants';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';
import {
  LeaderboardItemSkeleton,
  LeaderboardHeaderCardSkeleton,
  getComponentsList,
  ErrorContent,
} from '@components';

import AnimatedLeaderboardHeaderCard from './AnimatedLeaderboardHeaderCard';
import {LeaderboardItem} from './LeaderboardItem';

const AnimatedFlatList =
  Animated.createAnimatedComponent<FlatListProps<LeaderboardEntry>>(FlatList);

export interface LeaderboardProps
  extends Omit<FlatListProps<LeaderboardEntry>, 'renderItem'> {
  refreshing: boolean;
  userId: string;
  bFitToClaimRaw?: number;
  onRefresh: () => void;
  activeLeague?: LeaguePublic;
  isMembersLoading: boolean;
  isLeagueLoading: boolean;
}

export const Leaderboard = ({
  data = [],
  userId,
  refreshing,
  bFitToClaimRaw,
  onRefresh,
  activeLeague,
  isMembersLoading,
  isLeagueLoading,
  ...listProps
}: LeaderboardProps) => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const [headerHeight, setHeaderHeight] = useState(0);

  const sharedContentOffset = useSharedValue(0);

  const isBfit = activeLeague?.access === LeagueAccess.CompeteToEarn;
  const membership = activeLeague?.participating
    ? activeLeague?.is_owner
      ? 'owner'
      : 'member'
    : 'none';

  const renderItem: ListRenderItem<LeaderboardEntry> = ({item, index}) => (
    <LeaderboardItem
      key={item.id}
      wins={item.wins}
      points={item.points}
      bfit={isBfit ? getViewBfitValue(item.bfit_estimate) : undefined}
      name={item.user.name}
      isSelf={item.user.id === userId}
      avatarUrl={item.user.avatar?.url_128x128}
      rank={item.rank ?? String(index + 1)}
      onPress={() => navigation.navigate('Profile', {id: item.user.id})}
    />
  );

  const handler = useAnimatedScrollHandler({
    onScroll: e => {
      sharedContentOffset.value = e.contentOffset.y;
    },
  });

  if (!isLeagueLoading && !activeLeague) {
    return <ErrorContent onRefresh={onRefresh} />;
  }

  return (
    <>
      {(isLeagueLoading || headerHeight === 0) && (
        <LeaderboardHeaderCardSkeleton />
      )}
      {(!isLeagueLoading || headerHeight !== 0) && activeLeague && (
        <AnimatedLeaderboardHeaderCard
          leagueId={activeLeague.id}
          membership={membership}
          memberCount={activeLeague.participants_total}
          resetDate={activeLeague.ends_at}
          startDate={activeLeague.starts_at}
          title={activeLeague.name}
          description={activeLeague.description}
          imageSource={{uri: activeLeague?.image.url_640x360}}
          sharedContentOffset={sharedContentOffset}
          bfitTotal={Math.trunc(
            getViewBfitValue(activeLeague.bfitAllocationEstimate),
          )}
          bFitToClaimRaw={bFitToClaimRaw}
          dailyBfit={activeLeague.daily_bfit}
          distributedTodayBfit={activeLeague.bfit_distributed_today}
          onHeightMeasure={setHeaderHeight}
          isCteLeague={isBfit}
          isPublic={
            activeLeague.access === LeagueAccess.Public ||
            activeLeague.access === LeagueAccess.CompeteToEarn
          }
        />
      )}
      {isMembersLoading && (
        <View style={{marginTop: 20}}>
          {getComponentsList(5, LeaderboardItemSkeleton)}
        </View>
      )}
      {!isMembersLoading && (
        <AnimatedFlatList
          {...listProps}
          ref={scrollRef}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => <View style={{height: headerHeight}} />}
          data={data}
          renderItem={renderItem}
          onScroll={handler}
          refreshControl={
            <RefreshControl
              {...{refreshing, onRefresh}}
              progressViewOffset={headerHeight}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </>
  );
};
