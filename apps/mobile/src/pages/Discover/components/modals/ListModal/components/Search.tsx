import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import React, {useCallback} from 'react';
import {NativeSyntheticEvent, TextInputChangeEventData} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {selectQuery, setQuery} from 'redux/discover/discoverSlice';
import {AppDispatch} from 'redux/store';
import styled, {useTheme} from 'styled-components/native';
import {Icon} from '@components';

export const SEARCH_HANDLE_HEIGHT = 68;

const Container = styled.View({
  paddingTop: 20,
  paddingBottom: 5,
  backgroundColor: 'transparent'
});

const CustomTextInput = styled(BottomSheetTextInput)(({theme}) => ({
  ...theme.typography.textInputValue,
  borderRadius: 50,
  height: 48,
  fontSize: 14,
  paddingLeft: 59,
  paddingVertical: 12,
  backgroundColor: 'rgba(172, 172, 172, 0.1)',
}));

const SearchIcon = styled(Icon)({
  position: 'absolute',
  marginTop: 35,
  marginLeft: 29,
});

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
        placeholderTextColor={'#ACACAC'}
        selectionColor={colors.accent}
        returnKeyType={'search'}
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onSubmitEditing={onSubmit}
      />
      <SearchIcon name={'search'} color={colors.accent} size={20} />
    </Container>
  );
};

export const Search = React.memo(_Search);
