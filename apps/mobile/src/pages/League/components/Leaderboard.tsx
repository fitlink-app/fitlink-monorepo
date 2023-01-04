import {Label} from '@components';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  PixelRatio,
  RefreshControl,
  View,
} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {LeaderboardItem} from './LeaderboardItem';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';
import {LeaderboardHeader} from './LeaderboardHeader';
import {useState} from 'react';
import {LeaderboardSeparator} from './LeaderboardSeparator';
import {useNavigation} from '@react-navigation/core';
import {useMe} from '@hooks';
import {Header} from 'pages/LeagueNew/components/Header';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

const INITIAL_MEMBER_COUNT_TO_DISPLAY = 10;

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

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

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
  title: string;
  memberCount: number;
  endDate: Date;
  membership: 'none' | 'member' | 'owner';
  onRefresh: () => void;
  renderHeader?: any;
  imageUri: string;
}

export const Leaderboard = ({
  data,
  fetchNextPage,
  fetchingNextPage,
  flanksData,
  userId,
  refreshing,
  isLoaded,
  isRepeat,
  title,
  memberCount,
  endDate,
  onRefresh,
  description,
  renderHeader,
  imageUri,
  onScroll,
}: LeaderboardProps) => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const {data: user} = useMe();

  const [showAll, setShowAll] = useState(false);

  let displayResults = data;

  if (!showAll) {
    const partialData = [...(data || [])];
    if (partialData.length > INITIAL_MEMBER_COUNT_TO_DISPLAY) {
      partialData.length = INITIAL_MEMBER_COUNT_TO_DISPLAY;
    }
    displayResults = partialData;
  }

  const displayResultsContainsUser = displayResults?.find(
    participant => participant.user_id === userId,
  );

  const renderItem = ({
    item,
    index,
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
        onPress={() => navigation.navigate('Profile', {id: item.user.id})}
        disabled={userId === item.user.id}
        name={item.user.name}
        avatarUrl={item.user.avatar?.url_128x128}
        wins={item.wins}
        points={item.points}
        isSelf={item.user_id === userId}
      />
    );
  };

  const renderFlanks = () => {
    return flanksData.map(entry => {
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
      {renderHeader}
      <LeaderboardHeader
        memberCount={memberCount}
        resetDate={endDate}
        repeat={isRepeat}
        title={title}
        description={description}
      />
    </>
  );

  const ListFooterComponent = () => {
    if (!data?.length && isLoaded) {
      return (
        <EmptyContainer style={{paddingVertical: 10}}>
          <Label>This league has no participants yet.</Label>
        </EmptyContainer>
      );
    }

    if (!isLoaded || fetchingNextPage) {
      return (
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      );
    }

    if (
      !showAll &&
      displayResults &&
      data &&
      displayResults.length < data.length
    ) {
      return (
        <>
          <LeaderboardSeparator onPress={() => setShowAll(true)} />
          {!!flanksData &&
            !!displayResults &&
            !displayResultsContainsUser &&
            renderFlanks()}
        </>
      );
    }

    return null;
  };

  const sv = useSharedValue(0);

  const handler = useAnimatedScrollHandler({
    onScroll: e => {
      sv.value = e.contentOffset.y / 1;
      console.log(sv.value);
    },
  });

  return (
    <>
      <Header
        memberCount={memberCount}
        resetDate={endDate}
        repeat={isRepeat}
        title={title}
        description={description}
        imageSource={{uri: imageUri}}
        scrollAnimatedValue={sv}
        bfitValue={15.41}
      />
      <AnimatedFlatList
        showsVerticalScrollIndicator={false}
        /* {...{ListHeaderComponent, ListFooterComponent}} */
        ListHeaderComponent={() => <View style={{height: 183}}/>}
        data={displayResults}
        renderItem={({item, index}) =>
          renderItem({item, index, sourceLength: displayResults?.length || 0})
        }
        initialNumToRender={25}
        onScroll={handler}
        // onEndReachedThreshold={0.1}
        // onEndReached={() => {
        //   if (showAll) {
        //     fetchNextPage();
        //   }
        // }}
        refreshControl={
          <RefreshControl
            {...{refreshing, onRefresh}}
            tintColor={colors.accent}
          />
        }
      />
    </>
  );
};
