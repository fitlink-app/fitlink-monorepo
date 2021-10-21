import {Label} from '@components';
import React from 'react';
import {ActivityIndicator, FlatListProps, RefreshControl} from 'react-native';
import {Animated} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {LeaderboardItem} from './LeaderboardItem';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';
import {LeaderboardHeader} from './LeaderboardHeader';
import {useState} from 'react';
import {LeaderboardSeparator} from './LeaderboardSeparator';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const INITIAL_MEMBER_COUNT_TO_DISPLAY = 10;

const Description = styled(Label).attrs({
  type: 'body',
  appearance: 'secondary',
})({marginHorizontal: 20, marginBottom: 20});

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

interface LeaderboardProps
  extends Omit<FlatListProps<LeaderboardEntry>, 'renderItem'> {
  fetchNextPage: () => void;
  fetchingNextPage: boolean;
  hasNextPage: boolean;
  refreshing: boolean;
  flanksData: any[];
  userId: string;
  isLoaded: boolean;
  description: string;
  isRepeat: boolean;
  endDate: Date;
  onRefresh: () => void;
}

export const Leaderboard = ({
  data,
  fetchNextPage,
  hasNextPage,
  fetchingNextPage,
  flanksData,
  userId,
  refreshing,
  isLoaded,
  isRepeat,
  endDate,
  onRefresh,
  description,
  ...rest
}: LeaderboardProps) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  const [showAll, setShowAll] = useState(false);

  let displayResults = data;

  if (!showAll) {
    const partialData = [...(data || [])];
    if (partialData.length > INITIAL_MEMBER_COUNT_TO_DISPLAY)
      partialData.length = INITIAL_MEMBER_COUNT_TO_DISPLAY;
    displayResults = partialData;
  }

  const displayResultsContainsUser = displayResults?.find(
    participant => participant.user_id === userId,
  );

  const renderItem = ({
    item,
    index,
    sourceLength,
    key,
  }: {
    item: LeaderboardEntry;
    index: number;
    sourceLength: number;
    key?: string;
  }) => {
    return (
      <LeaderboardItem
        key={item.id + key}
        rank={item.rank || (index + 1).toString()}
        name={item.user.name}
        avatarUrl={item.user.avatar?.url_128x128}
        wins={item.wins}
        points={item.points}
        isSelf={item.user_id === userId}
        isLast={sourceLength - 1 === index}
      />
    );
  };

  const renderFlanks = () => {
    return flanksData.map((entry, index) => {
      return renderItem({
        item: entry,
        index: entry.rank,
        sourceLength: flanksData?.length || 0,
        key: '_flanks',
      });
    });
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

    if (!isLoaded || fetchingNextPage)
      return (
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      );

    if (
      !showAll &&
      displayResults &&
      data &&
      displayResults.length < data.length
    )
      return (
        <>
          <LeaderboardSeparator onPress={() => setShowAll(true)} />
          {!!flanksData &&
            !!displayResults &&
            !displayResultsContainsUser &&
            renderFlanks()}
        </>
      );

    return null;
  };

  return (
    <Animated.FlatList
      {...{...rest, ListHeaderComponent, ListFooterComponent}}
      data={displayResults}
      renderItem={({item, index}) =>
        renderItem({item, index, sourceLength: displayResults?.length || 0})
      }
      initialNumToRender={25}
      onEndReachedThreshold={0.1}
      onEndReached={() => {
        if (showAll) fetchNextPage();
      }}
      refreshControl={
        <RefreshControl
          {...{refreshing, onRefresh}}
          tintColor={colors.accent}
        />
      }
    />
  );
};
