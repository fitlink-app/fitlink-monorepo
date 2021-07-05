import {Label} from '@components';
import React from 'react';
import {FlatListProps, RefreshControl} from 'react-native';
import {Animated, View} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {LeaderboardItem} from './LeaderboardItem';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';

const Description = styled(Label).attrs({
  type: 'body',
  appearance: 'secondary',
})({margin: 20});

interface LeaderboardProps extends Omit<FlatListProps<any>, 'renderItem'> {
  refreshing: boolean;
  description: string;
  onRefresh: () => void;
}

export const Leaderboard = ({
  refreshing,
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
      />
    );
  };

  const ListHeaderComponent = <Description>{description}</Description>;

  return (
    <Animated.FlatList
      {...{...rest, renderItem, ListHeaderComponent}}
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
