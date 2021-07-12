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
import {LeagueCard} from '@components';
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
  error?: Error;
  onRefresh?: () => void;
}

export const LeagueList = ({
  isFetching,
  isFetchingNextPage,
  isFetchedAfterMount,
  error,
  onRefresh,
  ListEmptyComponent,
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
        position={item.rank}
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

  return (
    <FlatList
      {...{
        ListFooterComponent,
        renderItem,
        keyExtractor,
      }}
      ListEmptyComponent={<EmptyContainer>{ListEmptyComponent}</EmptyContainer>}
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
