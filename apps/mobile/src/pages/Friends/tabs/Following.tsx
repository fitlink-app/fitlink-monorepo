import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Label, ProfileRow} from '@components';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useFollowing} from '@hooks';
import {ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import {getResultsFromPages} from 'utils/api';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Following = ({jumpTo}: {jumpTo: (tab: string) => void}) => {
  const {colors} = useTheme();

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
