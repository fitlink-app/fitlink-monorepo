import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';

import {Skeleton} from '@components';

const {width} = Dimensions.get('screen');

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
    marginHorizontal: 20,
  },
  titleSkeleton: {
    height: 16,
    width: 170,
  },
  seeAllSkeleton: {
    height: 16,
    width: 60,
  },
  rewardSkeleton: {
    borderRadius: 20,
    width: width - 40,
    height: 175,
    marginHorizontal: 20,
    marginTop: 23,
  },
});
