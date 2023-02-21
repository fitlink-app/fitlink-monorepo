import React from 'react';
import {View, Dimensions, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';

import {BfitSpinner} from '@components';

import {Label, Logo} from './common';

const {width: screenWidth} = Dimensions.get('screen');

interface UpdateInfoProps {
  message: string;
  progress: number;
}

const ProgressBar = ({progress = 0}: {progress: number}) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        width: screenWidth * progress,
        height: 1,
        backgroundColor: colors.accent,
        position: 'absolute',
        top: insets.top,
        left: 0,
      }}
    />
  );
};

export const UpdateInfo = ({message, progress}: UpdateInfoProps) => {
  const {colors} = useTheme();

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        flex: 1,
      }}>
      <ProgressBar {...{progress}} />
      <Logo size={'large'} />
      <View style={{position: 'absolute', bottom: 100}}>
        <BfitSpinner style={styles.loadingWrapper} />
        <Label>{message}</Label>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingWrapper: {
    paddingVertical: 20,
  },
});
