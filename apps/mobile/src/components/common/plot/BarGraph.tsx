import React, {FC} from 'react';
import {StackedBarChart, StackedBarChartProps} from 'react-native-svg-charts';
import {StyleProp, View, ViewStyle} from 'react-native';
import theme from '../../../theme/themes/fitlink';

export interface IBarGraphProps
  extends Pick<StackedBarChartProps<any>, 'contentInset'> {
  height: number;
  normalisedData: number[];
  barWidth: number;
  gapWidth: number;
  valueBarColor?: string;
  restBarColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const BarGraph: FC<IBarGraphProps> = ({
  valueBarColor = theme.colors.accent,
  restBarColor = 'rgba(255, 255, 255, 0.32)',
  contentInset,
  height,
  normalisedData,
  barWidth,
  gapWidth,
  containerStyle,
}) => {
  const graphData = normalisedData.map(value => ({
    valueHeight: value,
    restHeight: 1 - value,
  }));

  const spacingInner = gapWidth / (barWidth + gapWidth);
  const normalisedGraphWidth =
    graphData.length * (barWidth + gapWidth) - gapWidth;

  const colors = [valueBarColor, restBarColor];
  const keys = ['valueHeight', 'restHeight'];

  return (
    <View style={[containerStyle, {height, width: normalisedGraphWidth}]}>
      <StackedBarChart
        // @ts-ignore
        keys={keys}
        showGrid={false}
        colors={colors}
        data={graphData}
        animate
        style={{height}}
        spacingInner={spacingInner}
        contentInset={contentInset}
      />
    </View>
  );
};

export default BarGraph;
