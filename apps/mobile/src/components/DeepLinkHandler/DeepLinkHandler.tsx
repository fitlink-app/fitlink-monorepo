import React, {useEffect, useState} from 'react';
import {useQueryClient} from 'react-query';
import dynamicLinks from '@react-native-firebase/dynamic-links';

import {QueryKeys} from '@query';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

import {BfitSpinnerShimmer} from '../common';
import {useDynamicLinksHandler} from './hooks';

export const DeeplinkHandler = () => {
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();
  const {handleDynamicLink} = useDynamicLinksHandler();

  const fetchMe = async () => {
    // TODO: why fetchQuery doesn't return cached data??? It always initiates a call
    const cachedUser = queryClient.getQueryData<User>(QueryKeys.Me);
    if (cachedUser) {
      return cachedUser;
    }
    try {
      setIsLoading(true);
      return await queryClient.fetchQuery<User>(QueryKeys.Me);
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
          const me = await fetchMe();
          handleDynamicLink(link.url, me?.onboarded ?? false);
        }
      });
  }, []);

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(async link => {
      const me = await fetchMe();
      handleDynamicLink(link.url, me?.onboarded ?? false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <BfitSpinnerShimmer />;
  }

  return null;
};
