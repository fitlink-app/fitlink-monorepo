import {Label} from '@components';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  ListRenderItem,
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

const AnimatedFlatList =
  Animated.createAnimatedComponent<FlatListProps<LeaderboardEntry>>(FlatList);

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

  const renderItem: ListRenderItem<LeaderboardEntry> = ({item, index}) => (
    <LeaderboardItem
      key={item.id}
      wins={item.wins}
      points={item.points}
      name={item.user.name}
      isSelf={item.user.id === userId}
      avatarUrl={item.user.avatar?.url_128x128}
      rank={item.rank ?? String(index + 1)}
      onPress={() => navigation.navigate('Profile', {id: item.user.id})}
    />
  );

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
      console.log('scroll', e);
      sv.value = e.contentOffset.y / 1;
      console.log(sv.value);
    },
  });

  const [headerHeight, setHeaderHeight] = useState(0);

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
        onHeightMesure={setHeaderHeight}
      />
      {headerHeight !== 0 && (
        <AnimatedFlatList
          showsVerticalScrollIndicator={false}
          /* {...{ListHeaderComponent, ListFooterComponent}} */
          ListHeaderComponent={() => <View style={{height: headerHeight}} />}
          data={displayResults}
          renderItem={renderItem}
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
      )}
    </>
  );
};
