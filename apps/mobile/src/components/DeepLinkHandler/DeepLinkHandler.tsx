import React, {useEffect, useState} from 'react';
import dynamicLinks from '@react-native-firebase/dynamic-links';

import {prefetchMe} from '@api';

import {BfitSpinnerShimmer} from '../common';
import {useDynamicLinksHandler} from './hooks';

export const DeeplinkHandler = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {handleDynamicLink} = useDynamicLinksHandler();

  const prefetchMeIgnoringExceptions = async () => {
    try {
      setIsLoading(true);
      await prefetchMe();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then(async link => {
        if (link) {
          await prefetchMeIgnoringExceptions();
          handleDynamicLink(link.url);
        }
      });
  }, []);

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(async link => {
      await prefetchMeIgnoringExceptions();
      handleDynamicLink(link.url);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <BfitSpinnerShimmer />;
  }

  return null;
};
