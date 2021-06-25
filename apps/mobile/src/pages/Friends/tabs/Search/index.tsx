import React, {useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Label, ProfileRow} from '@components';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useSearchUsers} from '@hooks';
import {ActivityIndicator, FlatList} from 'react-native';
import {SearchBox} from './components';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
});

const SearchBoxContainer = styled.View({
  paddingHorizontal: 20,
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Search = () => {
  const {colors} = useTheme();

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
        isFollowed={false}
        actions={{
          onFollow: async () => {},
          onUnfollow: async () => {},
          onPress: () => {},
        }}
        userId={item.id}
        name={item.name}
        avatarUrl={item.avatar?.url}
      />
    );
  };

  const keyExtractor = (item: UserPublic) => item.id as string;

  const results = data?.pages.reduce<UserPublic[]>((acc, current) => {
    return [...acc, ...current.results];
  }, []);

  const ListHeaderComponent = (
    <SearchBoxContainer>
      <SearchBox
        {...{query, handleOnChangeText, handleOnSubmit}}
        placeholder={'Search for a user'}
        onClearPressed={() => handleOnChangeText('')}
      />
    </SearchBoxContainer>
  );

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
      {isFetching ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <Label
          type="body"
          appearance={'accentSecondary'}
          style={{textAlign: 'center'}}>
          {error
            ? error
            : data && query.length
            ? `No results found for "${query}"`
            : `Find friends, colleagues and others.`}
        </Label>
      )}
    </EmptyContainer>
  );

  return (
    <Wrapper>
      <FlatList
        {...{
          ListHeaderComponent,
          ListFooterComponent,
          ListEmptyComponent,
          renderItem,
          keyExtractor,
        }}
        onEndReachedThreshold={0.2}
        onEndReached={() => fetchNextPage()}
        data={results}
      />
    </Wrapper>
  );
};
