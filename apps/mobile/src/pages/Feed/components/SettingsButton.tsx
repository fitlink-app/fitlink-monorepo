import {TouchHandler} from '@components';
import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {Image} from 'react-native';

export const SettingsButton = () => {
  const navigation = useNavigation();

  return (
    <TouchHandler
      style={{marginLeft: 10}}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      onPress={() => {
        navigation.navigate('Settings');
      }}>
      <Image source={require('../../../assets/images/icon/sliders.png')} />
    </TouchHandler>
  );
};
