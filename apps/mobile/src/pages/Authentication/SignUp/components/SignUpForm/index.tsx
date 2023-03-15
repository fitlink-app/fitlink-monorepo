import React, {useRef} from 'react';
import {TextInput} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/core';

import {useForm} from '@hooks';
import {Button, FormError, InputField, Label} from '@components';

import {PrivacyPolicyLabel, TermsOfServiceLabel} from './components';
import {
  selectLastClientSideAccessGranted,
  signUp,
} from '../../../../../redux/auth';
import {useAppDispatch, useAppSelector} from '../../../../../redux/store';

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
  const navigation = useNavigation();

  const dispatch = useAppDispatch();
  const lastClientSideAccessGranted = useAppSelector(
    selectLastClientSideAccessGranted,
  );

  const passwordFieldRef = useRef<TextInput>(null);

  const initialValues: SignUpFormValues = {email: '', password: ''};

  const {
    handleChange,
    handleSubmit,
    values,
    fieldErrors,
    errorMessage,
    isSubmitting,
  } = useForm(initialValues);

  const onSubmit = async () => {
    const credentials = {email: values.email, password: values.password};

    try {
      // TODO: rework handle submit logic!!! it must not accept result as error
      //  instead handle error in handle submit
      await dispatch(signUp(credentials)).unwrap();
      if (!lastClientSideAccessGranted) {
        navigation.navigate('CreatePinCodeScreen');
      }
    } catch (e) {
      return e;
    }
    return undefined;
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
        loadingText="Creating account..."
        onPress={() => handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={
          isSubmitting || !(values.email?.length && values.password?.length)
        }
      />

      <PrivacyPolicyLabel />
    </Wrapper>
  );
};
