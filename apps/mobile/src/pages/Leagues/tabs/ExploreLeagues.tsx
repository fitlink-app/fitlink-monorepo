import React, {useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Icon, Label, LeagueCard, SearchBox, TouchHandler} from '@components';
import {
  League,
  LeagueAccess,
} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {useLeagues, useSearchLeagues} from '@hooks';
import {ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
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

const SearchBoxContainer = styled.View({
  marginBottom: 20,
});

const SearchCaptionWrapper = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  paddingBottom: 0,
});

const GoBackButtonContent = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: 10,
  marginTop: 5,
  paddingHorizontal: 15,
});

export const ExploreLeagues = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const [query, setQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [displaySearchResults, setDisplaySearchResults] = useState(false);

  const {
    data,
    isFetching,
    isFetchedAfterMount,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
    error,
  } = useLeagues();

  const {
    data: searchData,
    isFetching: isSearchFetching,
    isFetchingNextPage: isSearchFetchingNextPage,
    isFetched: isSearchFetched,
    fetchNextPage: searchFetchNextPage,
    error: searchError,
  } = useSearchLeagues(query);

  const activeData = displaySearchResults ? searchData : data;
  const activeFetchNextPage = displaySearchResults
    ? searchFetchNextPage
    : fetchNextPage;
  const activeIsFetching = displaySearchResults ? isSearchFetching : isFetching;
  const activeIsFetchingNextPage = displaySearchResults
    ? isSearchFetchingNextPage
    : isFetchingNextPage;
  const activeError = displaySearchResults ? searchError : error;

  const results =
    activeData?.pages.reduce<League[]>((acc, current) => {
      return [...acc, ...current.results];
    }, []) || [];

  const renderItem = ({item}: {item: League}) => {
    return (
      <LeagueCard
        name={item.name}
        sport={item.sport.name}
        imageUrl={item.image.url}
        memberCount={item.participants_total}
        position={999}
        privateLeague={item.access === ('Private' as LeagueAccess)}
        onPress={() => {
          navigation.navigate('League', {id: item.id, league: item});
          console.log(item);
        }}
      />
    );
  };

  const keyExtractor = (item: League) => item.id as string;

  const handleOnChangeText = (text: string) => {
    setQuery(text);
  };

  const handleOnSubmit = () => {
    if (!query.length) {
      setDisplaySearchResults(false);
      return;
    }

    searchFetchNextPage();
    setLastQuery(query);
    setDisplaySearchResults(true);
  };

  const GoBackButton = () => (
    <TouchHandler
      onPress={() => {
        setDisplaySearchResults(false);
        setQuery('');
      }}>
      <GoBackButtonContent>
        <Icon
          name={'arrow-left'}
          color={colors.accent}
          size={14}
          style={{marginRight: 5}}
        />
        <Label appearance={'accent'}>Go Back</Label>
      </GoBackButtonContent>
    </TouchHandler>
  );

  const ListHeaderComponent = (
    <SearchBoxContainer>
      <SearchBox
        {...{query, handleOnChangeText, handleOnSubmit}}
        placeholder={'Search for a league'}
        onClearPressed={() => handleOnChangeText('')}
      />

      {displaySearchResults && (
        <SearchCaptionWrapper>
          {results.length !== 0 ? (
            <Label>
              Showing results for "
              <Label appearance={'primary'}>{lastQuery}</Label>"
            </Label>
          ) : isSearchFetching ? (
            <>
              <Label>
                Searching for "<Label appearance={'primary'}>{lastQuery}</Label>
                "
              </Label>
            </>
          ) : isSearchFetched ? (
            <Label>
              No results found for "
              <Label appearance={'primary'}>{lastQuery}</Label>"
            </Label>
          ) : (
            <Label>Search for a League</Label>
          )}
          <GoBackButton />
        </SearchCaptionWrapper>
      )}
    </SearchBoxContainer>
  );

  const ListFooterComponent = activeIsFetchingNextPage ? (
    <EmptyContainer style={{height: 72}}>
      <ActivityIndicator color={colors.accent} />
    </EmptyContainer>
  ) : null;

  const ListEmptyComponent = activeIsFetchingNextPage ? null : (
    <EmptyContainer
      style={{
        justifyContent: isFetching ? 'center' : 'flex-start',
        paddingTop: 50,
        paddingHorizontal: 20,
      }}>
      {activeIsFetching && !isFetchedAfterMount ? (
        <ActivityIndicator color={colors.accent} />
      ) : activeError ? (
        <Label
          type="body"
          appearance={'accentSecondary'}
          style={{textAlign: 'center'}}>
          {activeError.message}
        </Label>
      ) : (
        !displaySearchResults && (
          <Label
            type="body"
            appearance={'accentSecondary'}
            style={{textAlign: 'center'}}>
            There are no ongoing leagues at the moment.
          </Label>
        )
      )}
    </EmptyContainer>
  );

  return (
    <Wrapper>
      <LeagueList
        {...{ListHeaderComponent}}
        data={results}
        isFetching={activeIsFetching}
        isFetchingNextPage={activeIsFetchingNextPage}
        isFetchedAfterMount={isFetchedAfterMount}
        noResultsText={'There are no ongoing leagues at the moment.'}
        onEndReached={() => activeFetchNextPage()}
        onRefresh={() => {
          setDisplaySearchResults(false);
          setQuery('');
          refetch();
        }}
      />
      {/* <FlatList
        {...{
          ListHeaderComponent,
          ListFooterComponent,
          ListEmptyComponent,
          renderItem,
          keyExtractor,
        }}
        contentContainerStyle={{padding: 20}}
        onEndReachedThreshold={0.2}
        onEndReached={() => activeFetchNextPage()}
        data={results}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && isFetchedAfterMount}
            onRefresh={() => {
              setDisplaySearchResults(false);
              setQuery('');
              refetch();
            }}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      /> */}
    </Wrapper>
  );
};
