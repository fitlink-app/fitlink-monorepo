import React from 'react';
import {
  FlatListProps,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  League,
  LeagueAccess,
} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import styled, {useTheme} from 'styled-components/native';
import {Label, LeagueCard} from '@components';
import {useNavigation} from '@react-navigation/core';

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

interface LeagueListProps extends Omit<FlatListProps<League>, 'renderItem'> {
  isFetching: boolean;
  isFetchingNextPage: boolean;
  isFetchedAfterMount: boolean;
  noResultsText: string;
  error?: Error;
  onRefresh?: () => void;
}

export const LeagueList = ({
  isFetching,
  isFetchingNextPage,
  isFetchedAfterMount,
  noResultsText,
  error,
  onRefresh,
  ...rest
}: LeagueListProps) => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const keyExtractor = (item: League) => item.id as string;

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
        }}
      />
    );
  };

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
          {noResultsText}
        </Label>
      )}
    </EmptyContainer>
  );

  return (
    <FlatList
      {...{
        ListFooterComponent,
        ListEmptyComponent,
        renderItem,
        keyExtractor,
      }}
      contentContainerStyle={{padding: 20}}
      onEndReachedThreshold={0.2}
      refreshControl={
        <RefreshControl
          {...{onRefresh}}
          refreshing={isFetching && isFetchedAfterMount}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
      {...rest}
    />
  );
};
