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
}) => <BarGraph {...rest} normalisedData={weeklyEarnings} />;

export default WeeklyEarningsGraph;
