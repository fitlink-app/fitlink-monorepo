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
  paddingVertical: 17,
});

const StyledLabel = styled(SettingsItemLabel)({
  fontSize: 14,
  paddingRight: 20,
});

const ErrorLabel = styled(Label)(({theme: {colors}}) => ({
  color: colors.danger,
  fontSize: 10,
}));

interface StyledTextInputParams {
  displayName?: boolean;
  error: string | undefined;
  theme: DefaultTheme;
}

const StyledTextInput = styled.TextInput.attrs<StyledTextInputParams>(
  ({theme: {colors}}) => ({
    placeholderTextColor: colors.secondaryText,
    selectionColor: colors.accent,
    textAlign: 'right',
  }),
)<StyledTextInputParams>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({displayName, error, theme: {typography, colors}}) => ({
    ...typography.textInputValue,
    color: displayName ? colors.secondaryText : colors.text,
    fontSize: 14,
    margin: 0,
    padding: 0,
  }),
);

interface SettingsInputProps {
  /** Display label of this button */
  label: string;

  /** Called when the user submits or blurs the input field */
  onEndEditing?: () => void;

  /** Error message (if any) */
  error?: string;

  /** displayName */
  displayName?: boolean;
}

export const SettingsInput: React.FC<
  SettingsInputProps & TextInputProps
> = props => {
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
    <SettingsItemWrapper
      style={{minHeight: 50, borderColor: '#2e2e2e', borderTopWidth: 1}}>
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
