import React, {useRef} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {useScrollToTop} from '@react-navigation/native';

import {Label, ProfileRow} from '@components';
import {useFollowing} from '@hooks';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';

import {getResultsFromPages} from 'utils/api';
import {BfitSpinner} from '../../../components/common/BfitSpinner';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
  // marginTop: 25,
  // paddingTop: 20
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Following = ({jumpTo}: {jumpTo: (tab: string) => void}) => {
  const {colors} = useTheme();

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const {
    data,
    isFetching,
    isFetchedAfterMount,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
    error,
  } = useFollowing();

  const renderItem = ({item}: {item: UserPublic}) => {
    return (
      <ProfileRow
        teamName={item.team_name}
        leagueNames={item.league_names}
        isFollowed={!!item.following}
        userId={item.id}
        name={item.name}
        avatarUrl={item.avatar?.url}
      />
    );
  };

  const keyExtractor = (item: UserPublic) => item.id as string;

  const results = getResultsFromPages(data);

  const ListFooterComponent = isFetchingNextPage ? (
    <EmptyContainer style={{height: 72}}>
      <BfitSpinner />
    </EmptyContainer>
  ) : null;

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
          Get more motivated by following friends and inspirational athletes.{' '}
          <Label onPress={() => jumpTo('search')}>Search</Label> to find them
          now.
        </Label>
      )}
    </EmptyContainer>
  );

  return (
    <Wrapper>
      <FlatList
        {...{
          ListFooterComponent,
          ListEmptyComponent,
          renderItem,
          keyExtractor,
        }}
        ref={scrollRef}
        onEndReachedThreshold={0.2}
        onEndReached={() => fetchNextPage()}
        data={results}
        refreshControl={
          <RefreshControl
            refreshing={
              isFetching && isFetchedAfterMount && !isFetchingNextPage
            }
            onRefresh={refetch}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />
    </Wrapper>
  );
};
