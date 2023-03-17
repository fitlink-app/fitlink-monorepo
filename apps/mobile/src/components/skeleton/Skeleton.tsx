import React, {FC} from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export const Skeleton: FC<{children: JSX.Element}> = ({children}) => (
  <SkeletonPlaceholder
    enabled={true}
    direction={'right'}
    backgroundColor={'#161616'}
    highlightColor={'#565656'}
  >
    {children}
  </SkeletonPlaceholder>
);
