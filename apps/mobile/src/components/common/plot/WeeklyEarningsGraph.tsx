import React, {FC} from 'react';

import {useWeeklyEarnings} from '@hooks';

import BarGraph, {IBarGraphProps} from './BarGraph';

type WeeklyEarningsGraphProps = Pick<
  IBarGraphProps,
  'barWidth' | 'gapWidth' | 'height' | 'containerStyle'
>;

export const WeeklyEarningsGraph: FC<WeeklyEarningsGraphProps> = ({
  barWidth,
  gapWidth,
  height,
  containerStyle,
}) => {
  const {weeklyEarnings} = useWeeklyEarnings();

  return (
    <BarGraph
      barWidth={barWidth}
      gapWidth={gapWidth}
      height={height}
      normalisedData={weeklyEarnings}
      containerStyle={containerStyle}
    />
  );
};

export default WeeklyEarningsGraph;
