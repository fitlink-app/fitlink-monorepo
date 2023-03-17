import React from 'react';
import {StyleSheet, View} from 'react-native';

import {Skeleton} from '@components';

export const LeaderboardHeaderCardSkeleton: React.FC = () => {
  return (
    <Skeleton>
      <>
        <View style={styles.image} />
        <View style={styles.line} />
        <View style={styles.row}>
          <View style={styles.skeletonLeaderboard} />
          <View style={styles.skeletonClaimButton} />
        </View>
      </>
    </Skeleton>
  );
};

const styles = StyleSheet.create({
  image: {
    position: 'relative',
    width: '100%',
    height: 352,
  },
  line: {
    position: 'relative',
    height: 50,
    marginTop: 20,
    marginLeft: 18,
    marginRight: 18,
    width: 356,
    borderRadius: 5,
  },
  row: {
    marginTop: 20,
    marginLeft: 18,
    marginRight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonLeaderboard: {
    width: 178,
    height: 30,
    borderRadius: 5,
  },
  skeletonClaimButton: {
    width: 150,
    height: 40,
    borderRadius: 20,
  },
});
