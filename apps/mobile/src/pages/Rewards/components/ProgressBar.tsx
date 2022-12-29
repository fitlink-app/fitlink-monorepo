import React from 'react';
import {View} from 'react-native';

interface ProgressBarProps {
  progress: number;
  height: number;
  width: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

const ProgressBar = ({
  progress,
  height,
  width,
  foregroundColor = '#00E9D7',
  backgroundColor = '#ACACAC',
}: ProgressBarProps): JSX.Element => (
  <View
    style={{
      height,
      width,
      backgroundColor,
      borderRadius: height,
      overflow: 'hidden',
    }}>
    <View
      style={{
        width: `${progress * 100}%`,
        height,
        backgroundColor: foregroundColor,
      }}
    />
  </View>
);

export default ProgressBar;
