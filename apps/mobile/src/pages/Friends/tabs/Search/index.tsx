import React, {useRef, useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Label, ProfileRow, SearchBox} from '@components';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useSearchUsers} from '@hooks';
import {ActivityIndicator, FlatList, Dimensions} from 'react-native';
import {getResultsFromPages} from 'utils/api';
import {useScrollToTop} from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const backgroundImage = require('../../../../../assets/images/user-search-bg.png');

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
});

const SearchBoxContainer = styled.View({
  paddingLeft: 30,
  paddingRight: 40,
  paddingBottom: 30,
  backgroundColor: '#181818',
  borderBottomLeftRadius: 31,
  borderBottomRightRadius: 31,
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
});

const UserSearchBackgroundImage = styled.Image({
  position: 'absolute',
  bottom: -80,
  left: -120,
  opacity: 0.3,
});

export const Search = () => {
  const {colors} = useTheme();

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const [query, setQuery] = useState('');

  const {data, isFetching, isFetchingNextPage, fetchNextPage, error} =
    useSearchUsers(query);

  const handleOnChangeText = (text: string) => {
    setQuery(text);
  };

  const handleOnSubmit = () => {
    fetchNextPage();
  };

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
      <ActivityIndicator color={colors.accent} />
    </EmptyContainer>
  ) : null;

  const ListEmptyComponent = isFetchingNextPage ? null : (
    <EmptyContainer
      style={{
        justifyContent: isFetching ? 'center' : 'flex-start',
        paddingTop: 60,
        height: SCREEN_HEIGHT-170,
      }}>
      {isFetching ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <Label
          type="body"
          appearance={'accentSecondary'}
          style={{textAlign: 'center', fontSize: 16}}>
          {error
            ? error.message
            : data && query.length
            ? `No results found for "${query}"`
            : `Find friends, colleagues and others...`}
        </Label>
      )}
      <UserSearchBackgroundImage source={backgroundImage} />
    </EmptyContainer>
  );

  return (
    <Wrapper>
    <SearchBoxContainer>
      <SearchBox
        {...{query, handleOnChangeText, handleOnSubmit}}
        placeholder={'Search for a user'}
        onClearPressed={() => handleOnChangeText('')}
      />
    </SearchBoxContainer>
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
      />
    </Wrapper>
  );
};
