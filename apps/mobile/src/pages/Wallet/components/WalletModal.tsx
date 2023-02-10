import React from 'react';

import {Banner} from '../../../components/modal';

const Info = () => (
  <Banner
    iconName="info"
    paragraphs={[
      ' The fiat value displayed here is based on our target listing price of 1 BFIT = $0.20',
      'Please note that this target price could change after TGE',
    ]}
  />
);

const ComingSoon = () => (
  <Banner
    title="Coming Soon"
    paragraphs={[
      'The ability to Buy, Sell and Stake your BFIT is coming soon.',
      'For now, keep competing and earning to build up your BFIT.',
      'We’ll alert you when this feature is live.',
      'Thank you',
    ]}
  />
);

export default Object.assign(
  {},
  {
    Info,
    ComingSoon,
  },
);
