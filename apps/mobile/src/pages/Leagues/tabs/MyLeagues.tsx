import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Icon, Label, TouchHandler} from '@components';
import {useMyLeagues} from '@hooks';
import {ActivityIndicator} from 'react-native';
import {getResultsFromPages} from 'utils/api';
import {LeagueList} from './components';
import {useNavigation} from '@react-navigation/native';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const ButtonContentContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

export const MyLeagues = ({jumpTo}: {jumpTo: (tab: string) => void}) => {
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
  } = useMyLeagues();

  const results = getResultsFromPages(data);

  const onCreateLeaguePressed = () => {
    navigation.navigate('LeagueForm');
  };

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

  const ListHeaderComponent = (
    <TouchHandler style={{paddingBottom: 20}} onPress={onCreateLeaguePressed}>
      <ButtonContentContainer>
        <Icon
          name={'plus'}
          size={16}
          color={colors.accentSecondary}
          style={{marginRight: 5}}
        />
        <Label type={'body'} appearance={'secondary'} bold>
          Create a new league
        </Label>
      </ButtonContentContainer>
    </TouchHandler>
  );

  return (
    <Wrapper>
      <LeagueList
        {...{
          isFetching,
          isFetchingNextPage,
          isFetchedAfterMount,
          ListEmptyComponent,
          // ListHeaderComponent,
        }}
        data={results}
        onEndReached={() => fetchNextPage()}
        onRefresh={refetch}
      />
    </Wrapper>
  );
};
