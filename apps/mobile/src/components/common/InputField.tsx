import React, {useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {TextInputProps, Platform} from 'react-native';
import {Icon} from './Icon';
import {FieldWrapper} from '../form';
import {Label} from './Label';

const Wrapper = styled(FieldWrapper)({width: '100%'});

const FieldContainer = styled.View({
  borderWidth: 1,
  borderRadius: 6,
  justifyContent: 'space-between',
  flexDirection: 'row',
});

const StyledTextField = styled.TextInput(({theme}) => ({
  ...theme.typography.textInputValue,
  flex: 1,
  height: '100%',
  textAlignVertical: 'top',
  flexWrap: 'wrap',
  paddingHorizontal: 14,
}));

const IconButtonContainer = styled.View({
  flexDirection: 'row',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  paddingRight: 14,
});

const InputFieldIcon = styled(Icon)({
  paddingLeft: 5,
});

const InputFieldLabel = styled(Label).attrs({
  type: 'body',
  appearance: 'primary',
})({marginBottom: 8});

export interface InputFieldProps extends TextInputProps {
  /** Makes the border red if set true */
  error?: string;

  /** Enable button to clear field value */
  clearButtonEnabled?: boolean;

  label?: string;
}

export const InputField = React.forwardRef(
  (props: InputFieldProps, ref: any) => {
    const [isFocused, setIsFocused] = useState<boolean>();
    const [isSecureTextHidden, setIsSecureTextHidden] = useState<boolean>(true);

    const {colors} = useTheme();

    const {
      error,
      value,
      style,
      secureTextEntry,
      multiline,
      clearButtonEnabled,
      onChangeText,
      label,
      ...rest
    } = props;

    let borderColor = colors.accentSecondary;

    if (error) {
      borderColor = colors.danger;
    } else if (isFocused && value && value.length !== 0) {
      borderColor = colors.accent;
    }

    const handleChangeText = (text: string) => {
      onChangeText && onChangeText(text);
    };

    return (
      <Wrapper {...{style, error}}>
        {!!label?.length && <InputFieldLabel>{label}</InputFieldLabel>}
        <FieldContainer
          style={[
            {
              borderColor,
              height: multiline ? 130 : 44,
              alignItems: multiline ? 'flex-start' : undefined,
              paddingVertical: multiline
                ? Platform.OS === 'android'
                  ? 0
                  : 6
                : undefined,
            },
          ]}>
          <StyledTextField
            style={{flex: 1}}
            ref={ref}
            multiline={multiline}
            secureTextEntry={secureTextEntry ? isSecureTextHidden : false}
            autoCapitalize={'none'}
            placeholderTextColor={colors.secondaryText}
            selectionColor={colors.accent}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChangeText={handleChangeText}
            {...rest}
            {...{value}}
          />

          {(clearButtonEnabled || secureTextEntry) && (
            <IconButtonContainer>
              {clearButtonEnabled && !!value && value.length !== 0 && (
                <InputFieldIcon
                  onPress={() => handleChangeText('')}
                  color={colors.accentSecondary}
                  name={'times'}
                  size={18}
                />
              )}

              {secureTextEntry && (
                <InputFieldIcon
                  onPress={() => setIsSecureTextHidden(!isSecureTextHidden)}
                  color={isSecureTextHidden ? colors.accentSecondary : 'white'}
                  name={isSecureTextHidden ? 'eye-slash' : 'eye'}
                  size={18}
                />
              )}
            </IconButtonContainer>
          )}
        </FieldContainer>
      </Wrapper>
    );
  },
);
