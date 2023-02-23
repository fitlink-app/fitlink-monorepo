import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';
import {FlatList, RefreshControl, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styled, {useTheme} from 'styled-components/native';

import {Label, LeagueCard} from '@components';
import {useLeagueInvitations} from '@hooks';

import {getResultsFromPages} from 'utils/api';
import {LeaguesInvitation} from '../../../../../api/src/modules/leagues-invitations/entities/leagues-invitation.entity';
import {LeagueAccess} from '../../../../../api/src/modules/leagues/leagues.constants';
import {IRefreshableTabHandle} from './types';
import {BfitSpinner} from '../../../components/common/BfitSpinner';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const InvitationsInner: ForwardRefRenderFunction<IRefreshableTabHandle> = (
  _,
  forwardedRef,
) => {
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

  useImperativeHandle(forwardedRef, () => ({
    refresh: refetch,
  }));

  const results = getResultsFromPages(data);

  const ListEmptyComponent = isFetchingNextPage ? null : (
    <EmptyContainer
      style={{
        justifyContent: isFetching ? 'center' : 'flex-start',
        paddingTop: 50,
        paddingHorizontal: 20,
      }}>
      {isFetching && !isFetchedAfterMount ? (
        <BfitSpinner />
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
        imageSource={{uri: league.image.url}}
        memberCount={league.participants_total}
        sportName={league.sport.name}
        position={league.rank}
        onPress={() => {
          navigation.navigate('League', {id: league.id, league});
        }}
      />
    );
  };

  const ListFooterComponent = isFetchingNextPage ? (
    <BfitSpinner wrapperStyle={styles.listFooterComponent} />
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

export const Invitations = forwardRef(InvitationsInner);

const styles = StyleSheet.create({
  listFooterComponent: {
    height: 72,
  },
});
