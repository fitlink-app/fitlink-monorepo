import React, {FC} from 'react';

export function getComponentsList(
  count: number,
  Component: FC<{index?: number}>,
) {
  return Array(count)
    .fill(0)
    .map((_, index) => {
      return <Component index={index} />;
    });
}
