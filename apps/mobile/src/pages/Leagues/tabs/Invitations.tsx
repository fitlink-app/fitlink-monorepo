import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Label} from '@components';
import {useLeagueInvitations} from '@hooks';
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

export const Invitations = ({jumpTo}: {jumpTo: (tab: string) => void}) => {
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

  // TODO: Format results for the list, create an union type for the LeagueList to support invite data
  console.log(results);

  return (
    <Wrapper>
      {/* <LeagueList
        {...{
          isFetching,
          isFetchingNextPage,
          isFetchedAfterMount,
          ListEmptyComponent,
        }}
        data={results}
        onEndReached={() => fetchNextPage()}
        onRefresh={refetch}
      /> */}
    </Wrapper>
  );
};
