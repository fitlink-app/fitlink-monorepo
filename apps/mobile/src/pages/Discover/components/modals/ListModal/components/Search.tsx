import React, {useCallback} from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputChangeEventData,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {selectQuery, setQuery} from 'redux/discover/discoverSlice';
import {AppDispatch} from 'redux/store';
import styled, {useTheme} from 'styled-components/native';

export const SEARCH_HANDLE_HEIGHT = 68;

const Container = styled.View({
  paddingVertical: 5,
});

const CustomTextInput = styled(TextInput)(({theme}) => ({
  ...theme.typography.textInputValue,
  marginTop: 4,
  marginBottom: 8,
  borderRadius: 15,
  fontSize: 16,
  padding: 12,
  backgroundColor: theme.colors.background,
}));

export const Search = () => {
  const {colors} = useTheme();
  const dispatch = useDispatch() as AppDispatch;

  const query = useSelector(selectQuery);

  const handleInputChange = useCallback(
    ({nativeEvent: {text}}: NativeSyntheticEvent<TextInputChangeEventData>) => {
      dispatch(setQuery(text));
    },
    [],
  );

  const handleInputFocus = useCallback(() => {
    console.log('TBD');
  }, []);

  const onSubmit = () => console.log('search');

  return (
    <Container>
      <CustomTextInput
        style={{color: colors.text}}
        textContentType="location"
        placeholder="Search for an activity"
        placeholderTextColor={colors.secondaryText}
        selectionColor={colors.accent}
        returnKeyType={'search'}
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onSubmitEditing={onSubmit}
      />
    </Container>
  );
};
