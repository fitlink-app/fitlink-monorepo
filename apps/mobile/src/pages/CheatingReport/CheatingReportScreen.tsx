import React from 'react';
import styled from 'styled-components/native';
import Intercom from '@intercom/intercom-react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {FlatList, ListRenderItem, RefreshControl} from 'react-native';

import theme from '@theme';
import {useLeagueMembers, useManualQueryRefresh, useMe} from '@hooks';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';

import {RootStackParamList} from '../../routes/types';
import {getResultsFromPages} from '../../utils/api';
import {LeaderboardItem} from '../League/components/LeaderboardItem';

export const CheatingReportScreen = () => {
  const {leagueId} =
    useRoute<RouteProp<RootStackParamList, 'CheatingReportScreen'>>().params;

  const {data: user} = useMe({
    enabled: false,
  });

  const {
    data: leagueMembersData,
    fetchNextPage,
    refetch,
  } = useLeagueMembers(leagueId, {
    enabled: false,
  });
  const leagueMembers = getResultsFromPages(leagueMembersData);

  const {refresh, isRefreshing} = useManualQueryRefresh(refetch);

  const report = (member: LeaderboardEntry) => {
    Intercom.displayMessageComposer(
      `Dear BFIT team,\nI think user\nName: ${member.user.name}\nId: ${member.user_id}\nis cheating`,
    );
  };

  const renderItem: ListRenderItem<LeaderboardEntry> = ({item, index}) => (
    <LeaderboardItem
      key={item.id}
      wins={item.wins}
      name={item.user.name}
      onPress={() => report(item)}
      isSelf={item.user.id === user?.id}
      avatarUrl={item.user.avatar?.url_128x128}
      rank={item.rank ?? String(index + 1)}
    />
  );

  return (
    <SWrapper>
      <FlatList
        data={leagueMembers}
        renderItem={renderItem}
        onEndReached={() => fetchNextPage()}
        ListHeaderComponent={() => (
          <STextWrapper>
            <STitle>Select cheater</STitle>
            <SDescription>
              If you suspect someone has been cheating, please select them, and
              we’ll investigate. Don’t worry; they won't know who reported them.
            </SDescription>
          </STextWrapper>
        )}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={isRefreshing}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        }
      />
    </SWrapper>
  );
};

const SWrapper = styled.View({
  flex: 1,
});

const STextWrapper = styled.View({
  marginHorizontal: 18,
  marginTop: 24,
  marginBottom: 14,
});

const STitle = styled.Text({
  fontSize: 32,
  lineHeight: 38,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
  marginBottom: 12,
});

const SDescription = styled.Text({
  fontSize: 14,
  lineHeight: 18,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
});

export default CheatingReportScreen;
