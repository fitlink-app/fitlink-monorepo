import {StyleSheet, View} from 'react-native';
import React from 'react';

import {Skeleton} from '@components';

export const FeedItemSkeleton = () => {
  return (
    <Skeleton>
      <View style={styles.containerRow}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={styles.skeletonIcon} />
          <View style={{flexDirection: 'column'}}>
            <View style={styles.skeletonHeaderLine} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
          </View>
        </View>
        <View style={styles.skeletonLike} />
      </View>
    </Skeleton>
  );
};

const styles = StyleSheet.create({
  containerRow: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 18,
    marginRight: 17,
    marginVertical: 22,
  },
  skeletonIcon: {
    width: 76,
    height: 76,
    borderRadius: 18,
  },
  skeletonHeaderLine: {
    height: 16,
    width: 170,
    borderRadius: 5,
    marginLeft: 10,
    marginTop: 0,
  },
  skeletonLine: {
    height: 14,
    width: 100,
    borderRadius: 5,
    marginLeft: 10,
    marginTop: 5,
  },
  skeletonLike: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 20,
    marginRight: 3,
  },
});
