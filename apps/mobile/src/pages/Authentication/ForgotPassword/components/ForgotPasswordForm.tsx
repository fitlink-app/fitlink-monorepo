import React from 'react';
import {Button, FormError, InputField, Label, Modal} from '@components';
import {useForm, useModal, useRequestPasswordReset} from '@hooks';
import styled from 'styled-components/native';
import {RequestError} from '@api';
import {useNavigation} from '@react-navigation/core';

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
  const {openModal, closeModal} = useModal();

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

  const onSubmit = async () => {
    try {
      await requestPasswordReset(values.email);

      openModal((id: string) => {
        return (
          <Modal
            title={'Password reset email sent'}
            description={`We have sent you an email containing password reset instructions.`}
            buttons={[
              {
                text: 'Close',
                onPress: () => closeModal(id),
              },
            ]}
          />
        );
      });

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
        }}>
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
