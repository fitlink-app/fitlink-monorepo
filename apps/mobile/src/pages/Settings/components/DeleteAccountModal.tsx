import React from 'react';
import {useDeleteMe} from '@hooks';
import {Button} from '@components';
import {Alert} from 'react-native';

interface DeleteAccountModalProps {
  onCloseCallback: (deleted: boolean) => void;
}

export const DeleteAccountModal = ({
  onCloseCallback,
}: DeleteAccountModalProps) => {
  const {mutateAsync: deleteAccount, isLoading: isDeletingAccount} =
    useDeleteMe();

  const handleDelete = async () => {
    try {
      await deleteAccount();
    } catch (e) {
      Alert.alert(
        'Something went wrong',
        `Unable to delete your account. Please contact support for additional help.`,
      );
    } finally {
      onCloseCallback(true);
    }
  };

  return (
    <>
      <Button
        style={{marginTop: 10}}
        type={'danger'}
        text={'Delete My Account'}
        onPress={handleDelete}
        loading={isDeletingAccount}
        loadingText={'Deleting account...'}
        disabled={isDeletingAccount}
      />
      <Button
        textOnly
        text={'Back'}
        style={{marginBottom: -10, marginTop: 10}}
        onPress={() => onCloseCallback(false)}
        disabled={isDeletingAccount}
      />
    </>
  );
};
