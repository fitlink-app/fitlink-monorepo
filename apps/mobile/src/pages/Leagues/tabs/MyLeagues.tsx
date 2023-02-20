import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';
import styled from 'styled-components/native';
import {Label} from '@components';
import {useMyLeagues} from '@hooks';
import {getResultsFromPages} from 'utils/api';
import {LeagueList} from './components';
import {widthLize} from '@utils';
import {IRefreshableTabHandle} from './types';
import {BfitSpinner} from '../../../components/common/BfitSpinner';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
  marginHorizontal: widthLize(20),
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

interface IMyLeaguesProps {
  jumpTo: (tab: string) => void;
}

const MyLeaguesInner: ForwardRefRenderFunction<
  IRefreshableTabHandle,
  IMyLeaguesProps
> = ({jumpTo}, forwardedRef) => {
  const {
    data,
    isFetching,
    isFetchedAfterMount,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
    error,
  } = useMyLeagues();

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

export const MyLeagues = forwardRef(MyLeaguesInner);
