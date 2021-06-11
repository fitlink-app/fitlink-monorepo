import React, {useRef} from 'react';
import {Button, InputField, Label} from '@components';
import {useAuth, useForm} from '@hooks';
import styled from 'styled-components/native';
import {TextInput} from 'react-native';

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

const SignInButton = styled(Button)({
  marginTop: 20,
});

export interface SignInFormValues {
  email: string;
  password: string;
}

interface SignInFormProps {
  onEmailChanged?: (text: string) => void;
}

export const SignInForm = ({onEmailChanged}: SignInFormProps) => {
  const {signIn} = useAuth();

  const passwordFieldRef = useRef<TextInput>(null);

  const initialValues: SignInFormValues = {email: '', password: ''};

  const {handleChange, handleSubmit, values, errors, setErrors, isSubmitting} =
    useForm(initialValues);

  const onSubmit = async () => {
    const credentials = {email: values.email, password: values.password};
    await signIn(credentials);
  };

  return (
    <Wrapper>
      <Title type={'title'}>Sign in</Title>

      <StyledInputField
        value={values.email}
        error={!!errors.email}
        onChangeText={text => {
          handleChange('email')(text);
          onEmailChanged && onEmailChanged(text);
        }}
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
        error={!!errors.password}
        onChangeText={handleChange('password')}
        clearButtonEnabled
        placeholder={'Password'}
        returnKeyType={'done'}
        secureTextEntry
        importantForAutofill={'yes'}
        textContentType="password"
        autoCompleteType={'password'}
      />

      <SignInButton
        text="Sign in"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={
          isSubmitting || !(values.email?.length && values.password?.length)
        }
      />
    </Wrapper>
  );
};
