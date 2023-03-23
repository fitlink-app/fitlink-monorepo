import React from 'react';
import {Button, FormError, InputField, Label} from '@components';
import {useForm, useRequestPasswordReset} from '@hooks';
import styled from 'styled-components/native';
import {RequestError} from '@api';
import {useNavigation} from '@react-navigation/core';
import {useDefaultOkSnackbar} from 'components/snackbar';

const Wrapper = styled.View({
  width: '100%',
});

const StyledInputField = styled(InputField)({
  marginBottom: 10,
});

const Title = styled(Label)({
  alignSelf: 'center',
  marginBottom: 20,
});

const SubmitButton = styled(Button)({
  marginTop: 20,
});

export interface ForgotPasswordFormValues {
  email: string;
}

interface ForgotPasswordFormProps {
  email?: string;
}

export const ForgotPasswordForm = ({email = ''}: ForgotPasswordFormProps) => {
  const navigation = useNavigation();

  const {mutateAsync: requestPasswordReset} = useRequestPasswordReset();
  const initialValues: ForgotPasswordFormValues = {email};

  const {
    handleChange,
    handleSubmit,
    values,
    fieldErrors,
    errorMessage,
    isSubmitting,
  } = useForm(initialValues);

  const showOkSnackbar = useDefaultOkSnackbar();

  const onSubmit = async () => {
    try {
      await requestPasswordReset(values.email);
      showOkSnackbar(
        'We have sent you an email containing password reset instructions.',
        false,
      );

      navigation.goBack();
    } catch (e) {
      return e as RequestError;
    }
  };

  return (
    <Wrapper>
      <Title type={'title'}>Enter your email address</Title>

      <StyledInputField
        value={values.email}
        error={fieldErrors.email}
        onChangeText={handleChange('email')}
        clearButtonEnabled
        placeholder={'E-mail address'}
        returnKeyType={'done'}
        importantForAutofill={'yes'}
        textContentType="emailAddress"
        autoCompleteType={'email'}
      />

      {!!errorMessage && <FormError>{errorMessage}</FormError>}

      <Label
        type={'subheading'}
        appearance={'secondary'}
        style={{
          textAlign: 'center',
          marginTop: 20,
        }}
      >
        We will send you instructions to reset your password
      </Label>

      <SubmitButton
        text="Send reset instructions"
        onPress={() => handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting || !values.email?.length}
      />
    </Wrapper>
  );
};
