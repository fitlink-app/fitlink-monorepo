import React, {FC} from 'react';

import {Banner} from '../../../components/modal';

export const OnlyOneTypeBanner: FC<{errorMessage: string}> = ({
  errorMessage,
}) => (
  <Banner
    iconSize={28}
    iconName="lock"
    title="Only one"
    paragraphs={[errorMessage]}
  />
);
