import React, {FC} from 'react';

export function getComponentsList(
  count: number,
  Element: FC<{index?: number}>,
) {
  return Array(count)
    .fill(0)
    .map((_, index) => {
      return <Element index={index} />;
    });
}
