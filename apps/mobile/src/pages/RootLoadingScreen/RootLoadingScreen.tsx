import React, {useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/core';
import {StackNavigationProp} from '@react-navigation/stack';

import {UpdateInfo} from '@components';
import {RootStackParamList} from '@routes';
import {useMe, useRevokeAccess} from '@hooks';

type NavigationType = StackNavigationProp<
  RootStackParamList,
  'RootLoadingScreen'
>;

export const RootLoadingScreen = () => {
  const navigation = useNavigation<NavigationType>();

  const isRevokedRef = useRef(false);

  const {revokeAccess} = useRevokeAccess();
  const {data: user, isLoading} = useMe();

  const isOnboarded = user?.onboarded;

  useEffect(() => {
    isRevokedRef.current = revokeAccess();
  }, [revokeAccess]);

  useEffect(() => {
    if (isLoading || isRevokedRef.current) {
      return;
    }

    if (isOnboarded) {
      navigation.navigate('HomeNavigator');
    } else {
      navigation.navigate('Onboarding');
    }
  }, [isLoading, isOnboarded, navigation]);

  return <UpdateInfo message="Loading data" />;
};
