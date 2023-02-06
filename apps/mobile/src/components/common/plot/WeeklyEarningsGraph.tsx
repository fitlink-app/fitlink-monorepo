import React, {FC} from 'react';

import BarGraph, {IBarGraphProps} from './BarGraph';

interface WeeklyEarningsGraphProps
  extends Pick<
    IBarGraphProps,
    'barWidth' | 'gapWidth' | 'height' | 'containerStyle'
  > {
  weeklyEarnings: number[];
}

export const WeeklyEarningsGraph: FC<WeeklyEarningsGraphProps> = ({
  weeklyEarnings,
  ...rest
}) => {
  // TODO: this normalization is not correct, confirm the max possible BFIT earned amount per day
  const max = weeklyEarnings.reduce((max, cur) => (cur > max ? cur : max), 0);
  const normalizedData = weeklyEarnings.map(e => e / max);

  return <BarGraph {...rest} normalisedData={normalizedData} />;
};

export default WeeklyEarningsGraph;
