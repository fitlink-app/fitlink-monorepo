import {StyleSheet, View} from 'react-native';
import React from 'react';

import {Skeleton} from '@components';
import theme from '@theme';

import {ITEM_HEIGHT} from '../../../pages/League/components/LeaderboardItem';

interface LeaderboardItemSkeletonProps {
  index?: number;
}

export const LeaderboardItemSkeleton: React.FC<LeaderboardItemSkeletonProps> =
  ({index = 0}) => {
    const rowBackgroundColor =
      index % 2 === 0 ? theme.colors.background : theme.colors.card;
    return (
      <View style={{backgroundColor: rowBackgroundColor}}>
        <Skeleton>
          <View style={styles.containerRow}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={styles.skeletonRank} />
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonName} />
            </View>

            <View style={styles.skeletonBfitNumber} />
          </View>
        </Skeleton>
      </View>
    );
  };

const styles = StyleSheet.create({
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingLeft: 20,
  },
  skeletonRank: {
    width: 10,
    height: 16,
    borderRadius: 5,
  },
  skeletonAvatar: {
    marginLeft: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  skeletonName: {
    marginLeft: 15,
    height: 20,
    width: 150,
    borderRadius: 5,
  },
  skeletonBfitNumber: {
    height: 16,
    width: 69,
    borderRadius: 5,
  },
});
