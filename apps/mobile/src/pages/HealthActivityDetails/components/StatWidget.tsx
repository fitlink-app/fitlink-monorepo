import {Label} from '@components';
import React from 'react';
import {View} from 'react-native';

export const StatWidget = ({value, label}: {value?: string; label: string}) => {
  return value ? (
    <View style={{width: 120}}>
      <Label type={'subheading'} appearance={'accent'}>
        {value}
      </Label>
      <Label type={'caption'} appearance={'primary'}>
        {label}
      </Label>
    </View>
  ) : null;
};
