import React, {useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Icon, Label, SearchBox, TouchHandler} from '@components';
import {useLeagues, useSearchLeagues} from '@hooks';
import {LeagueList} from './components';
import {getResultsFromPages} from 'utils/api';
import {ActivityIndicator} from 'react-native';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
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

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const ExploreLeagues = () => {
  const {colors} = useTheme();

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

  const results = getResultsFromPages(activeData);

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
          There are no ongoing leagues at the moment.
        </Label>
      )}
    </EmptyContainer>
  );

  return (
    <Wrapper>
      <LeagueList
        {...{ListHeaderComponent, ListEmptyComponent}}
        data={results}
        isFetching={activeIsFetching && !displaySearchResults}
        isFetchingNextPage={activeIsFetchingNextPage}
        isFetchedAfterMount={isFetchedAfterMount}
        onEndReached={() => activeFetchNextPage()}
        onRefresh={() => {
          setDisplaySearchResults(false);
          setQuery('');
          refetch();
        }}
      />
    </Wrapper>
  );
};
