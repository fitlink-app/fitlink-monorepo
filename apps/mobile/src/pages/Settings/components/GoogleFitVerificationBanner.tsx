import React, {FC} from 'react';

import {Banner} from '../../../components/modal';
import {Button} from '@components';

interface GoogleFitVerificationBannerProps {
  onPress: () => void;
}

export const GoogleFitVerificationBanner: FC<GoogleFitVerificationBannerProps> =
  ({onPress}) => (
    <Banner
      title="Connect to Google fit"
      paragraphs={[
        'Google Fit is an open platform that lets you control your fitness data from multiple apps and devices.',
        'By connecting BFIT and Google Fit, you can easily integrate your fitness activity from various sources to help you better understand your progress.',
        'You can disconnect from Google Fit at any time by going to Settings and tapping disconnect Google Fit.',
      ]}
      children={<Button onPress={onPress} />}
    />
  );
