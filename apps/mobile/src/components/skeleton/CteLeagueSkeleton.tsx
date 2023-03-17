import React from 'react';
import {StyleSheet, View} from 'react-native';

import {Skeleton} from '@components';

export const CteLeagueSkeleton = () => {
  return (
    <Skeleton>
      <>
        <View style={styles.titleContainer}>
          <View style={styles.titleSkeleton} />
        </View>
        <View style={styles.leagueSkeleton} />
      </>
    </Skeleton>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 20,
  },
  titleSkeleton: {
    height: 16,
    width: 250,
  },
  leagueSkeleton: {
    borderRadius: 20,
    height: 350,
    marginHorizontal: 20,
    marginTop: 23,
  },
});
