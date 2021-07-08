import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Label} from '@components';
import {useMyLeagues} from '@hooks';
import {ActivityIndicator} from 'react-native';
import {getResultsFromPages} from 'utils/api';
import {LeagueList} from './components';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const MyLeagues = ({jumpTo}: {jumpTo: (tab: string) => void}) => {
  const {colors} = useTheme();

  const {
    data,
    isFetching,
    isFetchedAfterMount,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
    error,
  } = useMyLeagues();

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
          You are not a member of any leagues right now.
          {'\n'}
          {'\n'}
          <Label onPress={() => jumpTo('explore')}>Explore</Label> your options
          and find the league that’s just your thing.
        </Label>
      )}
    </EmptyContainer>
  );

  return (
    <Wrapper>
      <LeagueList
        {...{
          isFetching,
          isFetchingNextPage,
          isFetchedAfterMount,
          ListEmptyComponent,
        }}
        data={results}
        onEndReached={() => fetchNextPage()}
        onRefresh={refetch}
      />
    </Wrapper>
  );
};
