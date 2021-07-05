import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Label} from '@components';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {useMyLeagues} from '@hooks';
import {ActivityIndicator, FlatList, RefreshControl} from 'react-native';

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

  const renderItem = ({item}: {item: League}) => {
    return <Label>{item.name}</Label>;
  };

  const keyExtractor = (item: League) => item.id as string;

  const results = data?.pages.reduce<League[]>((acc, current) => {
    return [...acc, ...current.results];
  }, []);

  const ListFooterComponent = isFetchingNextPage ? (
    <EmptyContainer style={{height: 72}}>
      <ActivityIndicator color={colors.accent} />
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
      <FlatList
        {...{
          ListFooterComponent,
          ListEmptyComponent,
          renderItem,
          keyExtractor,
        }}
        onEndReachedThreshold={0.2}
        onEndReached={() => fetchNextPage()}
        data={results}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && isFetchedAfterMount}
            onRefresh={refetch}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />
    </Wrapper>
  );
};
