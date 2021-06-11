import React from 'react';
import {
  Platform,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  KeyboardAvoidingViewProps,
} from 'react-native';

export const KeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> =
  props => (
    <RNKeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      {...props}
    />
  );
