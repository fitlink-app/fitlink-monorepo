import React from 'react';
import {StyleSheet, View} from 'react-native';

import {Skeleton} from '@components';

export const HorizontalSliderSkeleton = () => {
  return (
    <Skeleton>
      <>
        <View style={styles.titleContainer}>
          <View style={styles.titleSkeleton} />
          <View style={styles.seeAllSkeleton} />
        </View>
        <View style={styles.rewardSkeleton} />
      </>
    </Skeleton>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 15,
  },
  titleSkeleton: {
    height: 20,
    width: 170,
  },
  seeAllSkeleton: {
    height: 16,
    width: 60,
  },
  rewardSkeleton: {
    borderRadius: 20,
    height: 175,
    marginHorizontal: 15,
    marginTop: 25,
    marginVertical: 11,
  },
});
