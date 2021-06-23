import React, {useRef} from 'react';
import {Button, FormError, InputField} from '@components';
import {useForm} from '@hooks';
import styled from 'styled-components/native';
import {TextInput} from 'react-native';

const Wrapper = styled.View({
  width: '100%',
});

const StyledInputField = styled(InputField)({
  marginBottom: 10,
});

const SignUpButton = styled(Button)({
  marginTop: 20,
});

export interface UpdatePasswordFormValues {
  currentPassword: string;
  confirmPassword: string;
}

export const UpdatePasswordForm = () => {
  // TODO: Hook up with API
  const initialValues: UpdatePasswordFormValues = {
    currentPassword: '',
    confirmPassword: '',
  };

  const newPasswordFieldRef = useRef<TextInput>(null);

  const {
    handleChange,
    handleSubmit,
    values,
    fieldErrors,
    errorMessage,
    isSubmitting,
  } = useForm(initialValues);

  const onSubmit = async () => {
    // const credentials = {email: values.email, password: values.password};
    // const requestError = await signUp(credentials);
    // return requestError;
  };

  return (
    <Wrapper>
      <StyledInputField
        label={'Current Password'}
        value={values.currentPassword}
        error={fieldErrors.currentPassword}
        onChangeText={handleChange('currentPassword')}
        clearButtonEnabled
        onSubmitEditing={() => newPasswordFieldRef!.current!.focus()}
        placeholder={'Current Password'}
        returnKeyType={'next'}
        secureTextEntry
        importantForAutofill={'yes'}
        textContentType="password"
        autoCompleteType={'password'}
      />

      <StyledInputField
        ref={newPasswordFieldRef}
        label={'New Password'}
        value={values.confirmPassword}
        error={fieldErrors.confirmPassword}
        onChangeText={handleChange('confirmPassword')}
        clearButtonEnabled
        placeholder={'New Password'}
        returnKeyType={'done'}
        secureTextEntry
        importantForAutofill={'yes'}
        textContentType="password"
        autoCompleteType={'password'}
      />

      {!!errorMessage && !fieldErrors && <FormError>{errorMessage}</FormError>}

      <SignUpButton
        text="Update Password"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={
          isSubmitting ||
          !values.currentPassword.length ||
          !values.confirmPassword.length
        }
      />
    </Wrapper>
  );
};
