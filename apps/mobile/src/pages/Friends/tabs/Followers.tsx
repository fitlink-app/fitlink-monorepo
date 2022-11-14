import React, {useRef} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Label, ProfileRow} from '@components';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useFollowers} from '@hooks';
import {ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import {getResultsFromPages} from 'utils/api';
import {useScrollToTop} from '@react-navigation/native';

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'center',
  marginTop: 25,
  paddingTop: 20
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Followers = ({jumpTo}: {jumpTo: (tab: string) => void}) => {
  const {colors} = useTheme();

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const {
    data,
    isFetching,
    isFetchedAfterMount,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
    error,
  } = useFollowers();

  const renderItem = ({item}: {item: UserPublic}) => {
    return (
      <ProfileRow
        isFollowed={!!item.following}
        teamName={item.team_name}
        leagueNames={item.league_names}
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
          You don't have any followers yet.
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
        ref={scrollRef}
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
