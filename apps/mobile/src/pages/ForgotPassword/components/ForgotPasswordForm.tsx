import React from 'react';
import {Button, FormError, InputField, Label} from '@components';
import {useForm} from '@hooks';
import styled from 'styled-components/native';

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
  const initialValues: ForgotPasswordFormValues = {email};

  const {
    handleChange,
    handleSubmit,
    values,
    fieldErrors,
    errorMessage,
    isSubmitting,
  } = useForm(initialValues);

  const onSubmit = async () => {
    return {message: 'Not implemented.'} as any;
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

      <SubmitButton
        text="Send reset instructions"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting || !values.email?.length}
      />
    </Wrapper>
  );
};
