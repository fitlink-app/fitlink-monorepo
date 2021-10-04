import React from 'react';
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';

export interface TouchHandlerProps extends TouchableOpacityProps {}

export const TouchHandler: React.FC<TouchHandlerProps> = ({...rest}) => (
  <TouchableOpacity activeOpacity={0.65} {...rest} />
);
