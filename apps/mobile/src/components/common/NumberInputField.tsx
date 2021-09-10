import React from 'react';
import {TextInput, TextInputProps} from 'react-native';

export const NumberInputField = (props: TextInputProps) => {
  const onChangeText = (value: string) => {
    if (!props.onChangeText) return;

    if (value !== '') {
      const numRegex = /^(?=.*\d)\d*[\.\,]?\d*$/;
      if (!numRegex.test(value)) value = props.value || '';
    }

    props.onChangeText(value);
  };

  const onEndEditing = () => {
    let value = parseFloat(props.value || '');
    let result = value.toString();
    if (isNaN(value)) result = '0';
    onChangeText(result);
  };

  return <TextInput {...props} {...{onChangeText, onEndEditing}} />;
};
