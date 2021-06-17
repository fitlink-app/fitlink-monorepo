import React, {useRef} from 'react';
import styled, {DefaultTheme} from 'styled-components/native';
import {TextInput, TextInputProps} from 'react-native';
import {SettingsItemLabel} from './SettingsItemLabel';
import {Label} from '@components';
import {SettingsItemWrapper} from './SettingsItemWrapper';

const Column = styled.View({});

const ContainerRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 15,
});

const StyledLabel = styled(SettingsItemLabel)({
  paddingRight: 20,
});

const ErrorLabel = styled(Label)(({theme: {colors}}) => ({
  color: colors.danger,
  fontSize: 10,
}));

interface StyledTextInputParams {
  error: string | undefined;
  theme: DefaultTheme;
}

const StyledTextInput = styled.TextInput.attrs<StyledTextInputParams>(
  ({theme: {colors}}) => ({
    placeholderTextColor: colors.secondaryText,
    selectionColor: colors.accent,
    textAlign: 'right',
  }),
)<StyledTextInputParams>(({error, theme: {typography, colors}}) => ({
  ...typography.textInputValue,
  color: error ? colors.danger : typography.textInputValue.color,
  margin: 0,
  padding: 0,
}));

interface SettingsInputProps {
  /** Display label of this button */
  label: string;

  /** Called when the user submits or blurs the input field */
  onEndEditing?: () => void;

  /** Error message (if any) */
  error?: string;
}

export const SettingsInput: React.FC<SettingsInputProps & TextInputProps> =
  props => {
    const {label, error, onEndEditing, onChangeText, ...rest} = props;
    const inputRef = useRef<TextInput>(null);

    /** Right aligned textInputs do not show whitespace at the end of the string
     * this hack fixes the issue
     */
    function replaceSpace(text: string) {
      return text.replace(/\u0020/, '\u00a0');
    }

    function onFocus() {
      const value = rest.value ? rest.value.length : 0;
      inputRef.current?.setNativeProps({
        selection: {
          start: value,
          end: value,
        },
      });
    }

    return (
      <SettingsItemWrapper style={{height: 50}}>
        <ContainerRow>
          <Column>
            <StyledLabel children={label} />
            {error && <ErrorLabel children={error} />}
          </Column>

          <StyledTextInput
            {...rest}
            {...{onEndEditing, error}}
            ref={inputRef}
            onFocus={v => {
              onFocus();
              if (rest.onFocus) rest.onFocus(v);
            }}
            onChangeText={(text: string) => {
              inputRef.current?.setNativeProps({
                selection: null,
              });
              onChangeText && onChangeText(replaceSpace(text));
            }}
          />
        </ContainerRow>
      </SettingsItemWrapper>
    );
  };
