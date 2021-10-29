import React, {useRef} from 'react';
import {Button, FormError, InputField, Modal} from '@components';
import {useForm, useModal, useUpdatePassword} from '@hooks';
import styled from 'styled-components/native';
import {TextInput} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getErrors} from '@api';

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
  const navigation = useNavigation();
  const {openModal, closeModal} = useModal();

  const {mutateAsync} = useUpdatePassword();

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
    } catch (e) {
      const requestErrors = getErrors(e);
      console.log(requestErrors);
      return requestErrors;
    }

    openModal(
      id => (
        <Modal
          title={'Password Changed'}
          description={'Your password has been changed'}
          buttons={[
            {
              text: 'Ok',
              onPress: () => {
                closeModal(id);
                navigation.goBack();
              },
            },
          ]}
        />
      ),
      () => {
        navigation.goBack();
      },
    );

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
