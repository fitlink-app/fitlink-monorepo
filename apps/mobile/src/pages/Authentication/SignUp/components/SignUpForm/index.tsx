import React, {useRef} from 'react';
import {Button, FormError, InputField, Label} from '@components';
import {useForm} from '@hooks';
import styled from 'styled-components/native';
import {TextInput} from 'react-native';
import {PrivacyPolicyLabel, TermsOfServiceLabel} from './components';
import {useDispatch} from 'react-redux';
import {AppDispatch} from 'redux/store';
import {signUp} from 'redux/auth/authSlice';
import {RequestError} from '@api';

const Wrapper = styled.View({
  width: '100%',
});

const Title = styled(Label)({
  alignSelf: 'center',
  marginBottom: 20,
});

const StyledInputField = styled(InputField)({
  marginBottom: 10,
});

const SignUpButton = styled(Button)({
  marginTop: 20,
});

export interface SignUpFormValues {
  email: string;
  password: string;
}

export const SignUpForm = () => {
  // const {signUp} = useAuth();
  const dispatch = useDispatch() as AppDispatch;

  const passwordFieldRef = useRef<TextInput>(null);

  const initialValues: SignUpFormValues = {email: '', password: ''};

  const {
    handleChange,
    handleSubmit,
    values,
    fieldErrors,
    errorMessage,
    isSubmitting,
    isSubmitted,
  } = useForm(initialValues);

  const onSubmit = async () => {
    const credentials = {email: values.email, password: values.password};

    const result = await dispatch(signUp(credentials));
    return result.type === signUp.rejected.toString()
      ? (result.payload as RequestError)
      : undefined;
  };

  return (
    <Wrapper>
      <Title type={'title'}>Sign up with your email address</Title>

      <StyledInputField
        value={values.email}
        error={fieldErrors.email}
        onChangeText={handleChange('email')}
        clearButtonEnabled
        placeholder={'E-mail address'}
        returnKeyType={'next'}
        onSubmitEditing={() => passwordFieldRef!.current!.focus()}
        blurOnSubmit={false}
        importantForAutofill={'yes'}
        textContentType="emailAddress"
        autoCompleteType={'email'}
      />

      <StyledInputField
        ref={passwordFieldRef}
        value={values.password}
        error={fieldErrors.password}
        onChangeText={handleChange('password')}
        clearButtonEnabled
        placeholder={'Password'}
        returnKeyType={'done'}
        secureTextEntry
        importantForAutofill={'yes'}
        textContentType="password"
        autoCompleteType={'password'}
      />
      <TermsOfServiceLabel />

      {!!errorMessage && (!fieldErrors || !Object.keys(fieldErrors).length) && (
        <FormError>{errorMessage}</FormError>
      )}

      <SignUpButton
        text="Agree and Sign up"
        onPress={() => handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={
          isSubmitting ||
          isSubmitted ||
          !(values.email?.length && values.password?.length)
        }
      />

      <PrivacyPolicyLabel />
    </Wrapper>
  );
};
