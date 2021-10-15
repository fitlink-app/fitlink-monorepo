import React from 'react';
import {Button, FormError, InputField, Modal} from '@components';
import {useForm, useMe, useModal} from '@hooks';
import styled from 'styled-components/native';
import {useUpdateEmail} from '@hooks';
import {getErrors} from '@api';
import {useNavigation} from '@react-navigation/native';

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
  const navigation = useNavigation();
  const {openModal, closeModal} = useModal();

  const {data: userData} = useMe({refetchOnMount: false});
  const {mutateAsync} = useUpdateEmail();

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
    try {
      await mutateAsync({email: values.email});
    } catch (e) {
      const requestErrors = getErrors(e);
      return requestErrors;
    }

    openModal(
      id => (
        <Modal
          title={'E-mail Changed'}
          description={'A confirmation email has been sent to you'}
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

      {!!errorMessage && (!fieldErrors || !Object.keys(fieldErrors).length) && (
        <FormError>{errorMessage}</FormError>
      )}

      <SignUpButton
        text="Update E-mail Address"
        onPress={() => handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting || !values.email.length}
      />
    </Wrapper>
  );
};
