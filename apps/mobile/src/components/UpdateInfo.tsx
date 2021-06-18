import React from 'react';
import {View, Image, ActivityIndicator, Dimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'styled-components/native';
import {Label} from './common';

const {width: screenWidth} = Dimensions.get('screen');

const splashImage = require('../../assets/bootsplash_logo.png');

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
      <Image fadeDuration={0} source={splashImage} />
      <View style={{position: 'absolute', bottom: 100}}>
        <ActivityIndicator
          style={{paddingVertical: 20}}
          color={colors.accent}
        />

        <Label>{message}</Label>
      </View>
    </View>
  );
};
