import React from 'react';

import {Banner} from '../../../components/modal';

export const MaxedOutBanner = () => (
  <Banner
    iconSize={28}
    iconName="lock"
    title="Maxed out"
    paragraphs={[
      'You are already competing in a maximum of three Compete to Earn leagues.',
      'Remember, you can only join three Compete to Earn leagues, each being a different activity type, so to join this league, leave one and try again.',
    ]}
  />
);
