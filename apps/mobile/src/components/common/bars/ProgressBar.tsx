import React, {useState, useRef, useEffect} from 'react';
import {View, LayoutChangeEvent, Animated} from 'react-native';
import {Svg, Line} from 'react-native-svg';

import styled, {useTheme} from 'styled-components/native';
import {animateProgress, createBloomEffect} from './progressMethods';

const ProgressFillMask = styled.View({
  borderRadius: 999,
  overflow: 'hidden',
});

interface ProgressBarProps {
  /** Progress mapped between 0-1 */
  progress: number;

  /** Height of the progress bar */
  height?: number;

  /** Height of the background bar, will be the same as height if unset */
  backgroundHeight?: number;

  /** If width is undefined, it will fill the available space */
  width?: number;

  /** Sets the radius of the bloom effect (defaults to 8) (iOS only) */
  bloomRadius?: number;

  /** Sets the intensity of the bloom effect 0-1 (iOS only) */
  bloomIntensity?: number;
}

export const _ProgressBar = (props: ProgressBarProps) => {
  const {
    progress,
    height = 10,
    backgroundHeight = height,
    bloomRadius = 8,
    bloomIntensity = 0,
    width,
  } = props;

  const {colors} = useTheme();

  const [layoutWidth, setLayoutWidth] = useState<number>(width || 0);
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

  // Measure wrapper width if rendered flexible
  const handleLayout = ({
    nativeEvent: {
      layout: {width: lw},
    },
  }: LayoutChangeEvent) => {
    if (width === undefined) setLayoutWidth(lw);
  };

  const Wrapper = styled.View({
    width,
  });

  let bgHeight = backgroundHeight || height;
  bgHeight = Math.min(bgHeight, height);

  // Additional length of the fill bar caused by SVG rounding
  const fillGap = height / 2;

  const ProgressBarBackground = styled.View({
    position: 'absolute',
    backgroundColor: colors.chartUnfilled,
    width: '100%',
    height: bgHeight,
    borderRadius: bgHeight / 2,
    top: fillGap - bgHeight / 2,
  });

  const AnimatedProgressBarFill = Animated.createAnimatedComponent(Line);

  const fillWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, layoutWidth],
    extrapolate: 'clamp',
  });

  const svgHeight = Math.max(height, bgHeight);

  // On android, circle with length of 0 will draw a dot
  // so we modify the color's alpha here based on progressAnim
  const strokeColor = colors.accent;
  const strokeColorAnimated = progressAnim.interpolate({
    inputRange: [0, 0.0001],
    outputRange: [`${strokeColor}00`, `${strokeColor}FF`],
    extrapolate: 'clamp',
  });

  return (
    <Wrapper onLayout={handleLayout}>
      <ProgressBarBackground />
      <Animated.View
        style={createBloomEffect(bloomIntensity, bloomRadius, bloomAnim)}>
        <ProgressFillMask>
          {/* Translate ProgressBarFill to hide additional width
                caused by strokeLineCap */}
          <View style={{left: -fillGap}}>
            <Svg width={layoutWidth + fillGap} height={height}>
              <AnimatedProgressBarFill
                x1={0}
                y1={svgHeight / 2}
                x2={fillWidth}
                y2={svgHeight / 2}
                stroke={strokeColorAnimated}
                strokeWidth={height}
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </ProgressFillMask>
      </Animated.View>
    </Wrapper>
  );
};

export const ProgressBar = React.memo(_ProgressBar);
