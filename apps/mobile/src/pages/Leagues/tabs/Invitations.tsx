import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Label, LeagueCard} from '@components';
import {useLeagueInvitations} from '@hooks';
import {ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import {getResultsFromPages} from 'utils/api';
import {useNavigation} from '@react-navigation/native';
import {LeaguesInvitation} from '../../../../../api/src/modules/leagues-invitations/entities/leagues-invitation.entity';
import {LeagueAccess} from '../../../../../api/src/modules/leagues/leagues.constants';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Invitations = ({jumpTo}: {jumpTo: (tab: string) => void}) => {
  const navigation = useNavigation();
  const {colors} = useTheme();

  const {
    data,
    isFetching,
    isFetchedAfterMount,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
    error,
  } = useLeagueInvitations();

  const results = getResultsFromPages(data);

  const ListEmptyComponent = isFetchingNextPage ? null : (
    <EmptyContainer
      style={{
        justifyContent: isFetching ? 'center' : 'flex-start',
        paddingTop: 50,
        paddingHorizontal: 20,
      }}>
      {isFetching && !isFetchedAfterMount ? (
        <ActivityIndicator color={colors.accent} />
      ) : error ? (
        <Label
          type="body"
          appearance={'accentSecondary'}
          style={{textAlign: 'center'}}>
          {error.message}
        </Label>
      ) : (
        <Label
          type="body"
          appearance={'accentSecondary'}
          style={{textAlign: 'center'}}>
          You don’t have any invitations at the moment.
        </Label>
      )}
    </EmptyContainer>
  );

  const keyExtractor = (item: LeaguesInvitation) => item.id as string;

  const renderItem = ({item}: {item: LeaguesInvitation}) => {
    const {league, from_user} = item;

    const organisation = league.organisation
      ? {
          name: league.organisation?.name,
          image: league.organisation?.avatar?.url_128x128,
        }
      : undefined;

    const invitedBy = {
      name: from_user.name,
      image: from_user.avatar?.url_128x128,
    };

    return (
      <LeagueCard
        {...{organisation, invitedBy}}
        name={league.name}
        sport={league.sport.name}
        imageUrl={league.image.url}
        memberCount={league.participants_total}
        position={league.rank}
        privateLeague={league.access === ('Private' as LeagueAccess)}
        onPress={() => {
          navigation.navigate('League', {id: league.id, league});
        }}
      />
    );
  };

  const ListFooterComponent = isFetchingNextPage ? (
    <EmptyContainer style={{height: 72}}>
      <ActivityIndicator color={colors.accent} />
    </EmptyContainer>
  ) : null;

  return (
    <Wrapper>
      <FlatList
        {...{
          ListFooterComponent,
          renderItem,
          keyExtractor,
        }}
        data={results}
        onEndReached={() => fetchNextPage()}
        ListEmptyComponent={
          <EmptyContainer>{ListEmptyComponent}</EmptyContainer>
        }
        contentContainerStyle={{padding: 20}}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl
            onRefresh={refetch}
            refreshing={isFetching && isFetchedAfterMount}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />
    </Wrapper>
  );
};
