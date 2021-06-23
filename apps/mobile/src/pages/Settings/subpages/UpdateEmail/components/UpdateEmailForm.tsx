import React from 'react';
import {Button, FormError, InputField} from '@components';
import {useForm, useMe} from '@hooks';
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

export interface UpdateEmailValues {
  email: string;
}

export const UpdateEmailForm = () => {
  // TODO: Hook up with API
  const {data: userData} = useMe({refetchOnMount: false});

  const initialValues: UpdateEmailValues = {email: ''};

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
        label={'New E-mail Address'}
        value={values.email}
        error={fieldErrors.email}
        onChangeText={handleChange('email')}
        clearButtonEnabled
        placeholder={userData?.email}
        returnKeyType={'next'}
        blurOnSubmit={false}
        importantForAutofill={'yes'}
        textContentType="emailAddress"
        autoCompleteType={'email'}
      />
      {!!errorMessage && !fieldErrors && <FormError>{errorMessage}</FormError>}

      <SignUpButton
        text="Update E-mail Address"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting || !values.email.length}
      />
    </Wrapper>
  );
};
