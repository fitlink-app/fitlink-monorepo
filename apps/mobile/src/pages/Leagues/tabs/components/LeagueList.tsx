import React, {useRef} from 'react';
import {
  FlatListProps,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import styled, {useTheme} from 'styled-components/native';
import {LeagueCard} from '@components';
import {useNavigation} from '@react-navigation/core';
import {LeagueAccess} from '../../../../../../api/src/modules/leagues/leagues.constants';
import {useScrollToTop} from '@react-navigation/native';

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

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const keyExtractor = (item: League) => item.id as string;

  const renderItem = ({item}: {item: League}) => {
    const organisation = item.organisation
      ? {
          name: item.organisation?.name,
          image: item.organisation?.avatar?.url_128x128,
        }
      : undefined;

    return (
      <LeagueCard
        name={item.name}
        sport={item.sport?.name}
        organisation={organisation}
        imageUrl={item.image?.url}
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
      ref={scrollRef}
      ListEmptyComponent={<EmptyContainer>{ListEmptyComponent}</EmptyContainer>}
      contentContainerStyle={{paddingTop: 20}}
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
