import React, {useState} from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  RefreshControl,
  View,
} from 'react-native';
import {useTheme} from 'styled-components/native';
import {LeaderboardItem} from './LeaderboardItem';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';
import {useNavigation} from '@react-navigation/core';
import {Header} from 'pages/League/components/Header';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

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
  isBfit?: boolean;
  leagueId: string;
  isPublic: boolean;
  onEditPressed: () => void;
}

// TODO: support pagination, page = 10 users
export const Leaderboard = ({
  data = [],
  userId,
  refreshing,
  isRepeat,
  title,
  memberCount,
  endDate,
  onRefresh,
  description,
  imageUri,
  membership,
  leagueId,
  onEditPressed,
  isPublic,
  isBfit = false,
}: LeaderboardProps) => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const [headerHeight, setHeaderHeight] = useState(0);

  const sharedOffsetY = useSharedValue(0);

  const renderItem: ListRenderItem<LeaderboardEntry> = ({item, index}) => (
    <LeaderboardItem
      key={item.id}
      isBfit={isBfit}
      wins={item.wins}
      points={item.points}
      name={item.user.name}
      isSelf={item.user.id === userId}
      avatarUrl={item.user.avatar?.url_128x128}
      rank={item.rank ?? String(index + 1)}
      onPress={() => navigation.navigate('Profile', {id: item.user.id})}
    />
  );

  const handler = useAnimatedScrollHandler({
    onScroll: e => {
      sharedOffsetY.value = e.contentOffset.y;
    },
  });

  return (
    <>
      <Header
        leagueId={leagueId}
        membership={membership}
        memberCount={memberCount}
        resetDate={endDate}
        repeat={isRepeat}
        title={title}
        description={description}
        imageSource={{uri: imageUri}}
        scrollAnimatedValue={sharedOffsetY}
        bfitValue={isBfit ? 15.41 : undefined}
        onHeightMeasure={setHeaderHeight}
        handleOnEditPressed={onEditPressed}
        isCteLeague={isBfit}
        isPublic={isPublic}
      />
      {headerHeight !== 0 && (
        <AnimatedFlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => <View style={{height: headerHeight}} />}
          data={data}
          renderItem={renderItem}
          onScroll={handler}
          refreshControl={
            <RefreshControl
              {...{refreshing, onRefresh}}
              progressViewOffset={headerHeight}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </>
  );
};
