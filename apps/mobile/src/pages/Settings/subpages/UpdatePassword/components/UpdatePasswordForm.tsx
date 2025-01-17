import {getErrors} from '@api';
import {Button, FormError, InputField} from '@components';
import {ResponseError} from '@fitlink/api-sdk/types';
import {useForm, useMe, useUpdatePassword} from '@hooks';
import {useNavigation} from '@react-navigation/native';
import {useDefaultOkSnackbar} from 'components/snackbar';
import React, {useRef} from 'react';
import {TextInput} from 'react-native';
import {useDispatch} from 'react-redux';
import {signIn} from 'redux/auth';
import {AppDispatch} from 'redux/store';
import styled from 'styled-components/native';

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
  const dispatch = useDispatch() as AppDispatch;
  const navigation = useNavigation();

  const showOkSnackbar = useDefaultOkSnackbar();

  const {mutateAsync} = useUpdatePassword();
  const {data: me} = useMe({enabled: false});

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
    try {
      await mutateAsync({
        current_password: values.currentPassword,
        new_password: values.confirmPassword,
      });

      await dispatch(
        signIn({email: me?.email!, password: values.confirmPassword}),
      ).unwrap();
    } catch (e) {
      const requestErrors = getErrors(e as ResponseError);
      console.error(requestErrors);
      return requestErrors;
    }
    showOkSnackbar('Your password has been changed');
    navigation.goBack();

    return undefined;
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

      {!!errorMessage && (!fieldErrors || !Object.keys(fieldErrors).length) && (
        <FormError>{errorMessage}</FormError>
      )}

      <SignUpButton
        text="Update Password"
        onPress={() => handleSubmit(onSubmit)}
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
