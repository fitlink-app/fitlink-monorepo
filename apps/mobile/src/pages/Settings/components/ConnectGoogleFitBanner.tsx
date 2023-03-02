import React, {FC, useState} from 'react';
import {StyleSheet} from 'react-native';

import {BfitButton, GoogleFitIcon, Banner} from '@components';

interface GoogleFitVerificationBannerProps {
  connect: () => Promise<unknown>;
}

export const ConnectGoogleFitBanner: FC<GoogleFitVerificationBannerProps> = ({
  connect,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const Icon = () => <GoogleFitIcon size={20} />;

  const onPress = async () => {
    try {
      setIsLoading(true);
      await connect();
    } finally {
      setIsLoading(false);
    }
  };

  const ButtonWrapper = () => (
    <BfitButton
      variant="google"
      onPress={onPress}
      LeadingIcon={Icon}
      isLoading={isLoading}
      text="Connect to Google Fit"
      style={styles.buttonWrapper}
    />
  );

  return (
    <Banner
      title="Connect to Google fit"
      paragraphs={[
        'Google Fit is an open platform that lets you control your fitness data from multiple apps and devices.',
        'By connecting BFIT and Google Fit, you can easily integrate your fitness activity from various sources to help you better understand your progress.',
        'You can disconnect from Google Fit at any time by going to Settings and tapping disconnect Google Fit.',
      ]}
      children={<ButtonWrapper />}
    />
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    alignSelf: 'center',
    marginBottom: 20,
  },
});
