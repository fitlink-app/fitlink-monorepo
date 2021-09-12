import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import React, {useCallback} from 'react';
import {NativeSyntheticEvent, TextInputChangeEventData} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {selectQuery, setQuery} from 'redux/discover/discoverSlice';
import {AppDispatch} from 'redux/store';
import styled, {useTheme} from 'styled-components/native';

export const SEARCH_HANDLE_HEIGHT = 68;

const Container = styled.View({
  paddingVertical: 5,
});

const CustomTextInput = styled(BottomSheetTextInput)(({theme}) => ({
  ...theme.typography.textInputValue,
  marginTop: 4,
  marginBottom: 8,
  borderRadius: 15,
  fontSize: 16,
  padding: 12,
  backgroundColor: theme.colors.background,
}));

interface SearchProps {
  onSubmit: () => void;
}

export const _Search = ({onSubmit}: SearchProps) => {
  const {colors} = useTheme();
  const dispatch = useDispatch() as AppDispatch;

  const query = useSelector(selectQuery);

  const handleInputChange = useCallback(
    ({nativeEvent: {text}}: NativeSyntheticEvent<TextInputChangeEventData>) => {
      dispatch(setQuery(text));
    },
    [],
  );

  const handleInputFocus = useCallback(() => {}, []);

  return (
    <Container>
      <CustomTextInput
        key={'search'}
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

export const Search = React.memo(_Search);