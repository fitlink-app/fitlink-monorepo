import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {Circle, G, Svg} from 'react-native-svg';
import styled, {useTheme} from 'styled-components/native';

import {animateProgress, createBloomEffect} from './progressMethods';

export interface ProgressCircleProps {
  progress: number;
  strokeWidth?: number;
  backgroundStrokeWidth?: number;
  backgroundStrokeColor?: string;
  size?: number;
  bloomRadius?: number;
  bloomIntensity?: number;
  children?: React.ReactNode;
  backgroundColor?: string;
}

export const ProgressCircle = (props: ProgressCircleProps) => {
  const {
    size = 90,
    strokeWidth = 6,
    bloomRadius = 8,
    bloomIntensity = 0,
    backgroundStrokeColor,
    children,
    backgroundColor,
  } = props;

  let {progress} = props;

  if (!isFinite(progress)) {
    progress = 0;
  }

  const theme = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const bloomAnim = useRef(new Animated.Value(0)).current;

  // Set initial value for progressAnim and bloomAnim
  useEffect(() => {
    progressAnim.setValue(progress);
    bloomAnim.setValue(progress === 1 ? 1 : 0);
  }, []);

  // Animate progressAnim whenever progress prop changes
  useEffect(() => {
    animateProgress(progress, progressAnim, bloomAnim);
  }, [progress]);

  // Circle calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const angle = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.PI * 2, 0],
    extrapolate: 'clamp',
  });

  const strokeDashoffset = Animated.multiply(angle, radius);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const ChildWrapper = styled.View({
    ...StyleSheet.absoluteFillObject,
    height: size,
    width: size,
    justifyContent: 'center',
    alignItems: 'center',
  });

  // On android, circle with length of 0 will draw a dot
  // so we modify the color's alpha here based on progressAnim
  const strokeColor = theme.colors.accent;
  const strokeColorAnimated = progressAnim.interpolate({
    inputRange: [0, 0.0001],
    outputRange: [`${strokeColor}00`, `${strokeColor}FF`],
    extrapolate: 'clamp',
  });

  return (
    <View>
      <Animated.View
        style={
          bloomIntensity && bloomRadius && bloomAnim
            ? createBloomEffect(bloomIntensity, bloomRadius, bloomAnim)
            : null
        }
      >
        <Svg height={size + strokeWidth} width={size + strokeWidth}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <AnimatedCircle
              strokeLinecap={'round'}
              stroke={backgroundStrokeColor ?? theme.colors.chartUnfilled}
              fill="none"
              cy={size / 2}
              cx={size / 2}
              r={radius}
              strokeWidth={3}
            />
            <AnimatedCircle
              strokeLinecap={'round'}
              stroke={strokeColorAnimated}
              fill={backgroundColor ?? 'none'}
              cy={size / 2}
              cx={size / 2}
              r={radius}
              strokeDasharray={[circumference]}
              {...{strokeWidth, strokeDashoffset}}
            />
          </G>
        </Svg>
      </Animated.View>

      <ChildWrapper>{children}</ChildWrapper>
    </View>
  );
};
