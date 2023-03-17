import React from 'react';
import {View, Dimensions, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import theme from '@theme';

import {Label, Logo, BfitSpinner} from './common';

const {width: screenWidth} = Dimensions.get('screen');

interface UpdateInfoProps {
  message: string;
  progress?: number;
}

const ProgressBar = ({progress = 0}: {progress: number}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.progress,
        {
          width: screenWidth * progress,
          top: insets.top,
        },
      ]}
    />
  );
};

export const UpdateInfo = ({message, progress = 0}: UpdateInfoProps) => {
  return (
    <View style={styles.wrapper}>
      <ProgressBar {...{progress}} />
      <Logo size="large" />
      <View style={{position: 'absolute', bottom: 100}}>
        <BfitSpinner wrapperStyle={styles.loadingWrapper} />
        <Label>{message}</Label>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingWrapper: {
    paddingVertical: 20,
  },
  progress: {
    left: 0,
    height: 1,
    position: 'absolute',
    backgroundColor: theme.colors.accent,
  },
});
