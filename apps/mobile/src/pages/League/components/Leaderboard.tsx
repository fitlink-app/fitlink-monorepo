import {Label} from '@components';
import React from 'react';
import {ActivityIndicator, FlatListProps, RefreshControl} from 'react-native';
import {Animated, View} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {LeaderboardItem} from './LeaderboardItem';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';
import {LeaderboardHeader} from './LeaderboardHeader';

const Description = styled(Label).attrs({
  type: 'body',
  appearance: 'secondary',
})({margin: 20});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 40,
});

const LoadingContainer = styled.View({
  height: 40,
  justifyContent: 'center',
});

interface LeaderboardProps extends Omit<FlatListProps<any>, 'renderItem'> {
  refreshing: boolean;
  isLoaded: boolean;
  isFetchingMore: boolean;
  description: string;
  isRepeat: boolean;
  endDate: Date;
  onRefresh: () => void;
}

export const Leaderboard = ({
  data,
  refreshing,
  isLoaded,
  isFetchingMore,
  isRepeat,
  endDate,
  onRefresh,
  description,
  ...rest
}: LeaderboardProps) => {
  const {colors} = useTheme();

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => {
    return (
      <LeaderboardItem
        key={item.id}
        index={index}
        name={item.user.name}
        avatarUrl={item.user.avatar?.url_128x128}
        wins={item.wins}
        points={item.points}
        isSelf={false}
        isLast={data?.length - 1 === index}
      />
    );
  };

  const ListHeaderComponent = (
    <>
      <Description>{description}</Description>
      <LeaderboardHeader resetDate={endDate} repeat={isRepeat} />
    </>
  );

  const ListFooterComponent = () => {
    if (!data?.length && isLoaded)
      return (
        <EmptyContainer style={{paddingVertical: 10}}>
          <Label>This league has no participants yet.</Label>
        </EmptyContainer>
      );

    if (!isLoaded)
      return (
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      );

    return null;
  };

  return (
    <Animated.FlatList
      {...{...rest, data, renderItem, ListHeaderComponent, ListFooterComponent}}
      initialNumToRender={25}
      refreshControl={
        <RefreshControl
          {...{refreshing, onRefresh}}
          tintColor={colors.accent}
        />
      }
    />
  );
};
