import React, {useRef} from 'react';
import {useNavigation} from '@react-navigation/core';
import {useScrollToTop} from '@react-navigation/native';
import {
  FlatListProps,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import styled, {useTheme} from 'styled-components/native';

import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {LeagueCard} from '@components';
import {BfitSpinner} from '../../../../components/common/BfitSpinner';

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

interface LeagueListProps
  extends Omit<FlatListProps<LeaguePublic>, 'renderItem'> {
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
  onRefresh,
  ListEmptyComponent,
  ...rest
}: LeagueListProps) => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  // Refs
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const keyExtractor = (item: LeaguePublic) => item.id as string;

  const renderItem = ({item}: {item: LeaguePublic}) => {
    return (
      <LeagueCard
        isVertical
        bfitValue={item.daily_bfit}
        name={item.name}
        imageSource={{uri: item.image?.url}}
        memberCount={item.participants_total}
        position={item.participating ? item.rank : undefined}
        onPress={() => {
          navigation.navigate('League', {id: item.id, league: item});
        }}
      />
    );
  };

  const ListFooterComponent = isFetchingNextPage ? (
    <BfitSpinner wrapperStyle={styles.listFooterComponent} />
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

const styles = StyleSheet.create({
  listFooterComponent: {
    height: 72,
  },
});
