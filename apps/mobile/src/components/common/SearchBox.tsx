import React from 'react';
import styled from 'styled-components/native';
import {InputField, InputFieldProps} from '@components';

const Wrapper = styled.View({});

interface SearchBoxProps extends Pick<InputFieldProps, 'onClearPressed'> {
  query: string;
  handleOnChangeText: (text: string) => void;
  handleOnSubmit: () => void;
  placeholder: string;
}

export const SearchBox = (props: SearchBoxProps) => {
  const {
    query,
    handleOnChangeText,
    handleOnSubmit,
    placeholder,
    onClearPressed,
  } = props;

  return (
    <Wrapper>
      <InputField
        autoCorrect={false}
        clearButtonEnabled={true}
        searchButtonEnabled={true}
        onClearPressed={onClearPressed}
        value={query}
        placeholder={placeholder}
        onChangeText={handleOnChangeText}
        returnKeyType={'search'}
        onSubmitEditing={handleOnSubmit}
        onEndEditing={handleOnSubmit}
        blurOnSubmit={true}
      />
    </Wrapper>
  );
};
