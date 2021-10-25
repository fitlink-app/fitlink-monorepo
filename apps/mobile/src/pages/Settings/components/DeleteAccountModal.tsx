import React, {useState} from 'react';
import {Button} from '@components';
import {Alert} from 'react-native';
import {useDispatch} from 'react-redux';
import {AppDispatch} from 'redux/store';
import {deleteAccount} from 'redux/auth/authSlice';
import api from '@api';

interface DeleteAccountModalProps {
  onCloseCallback: (deleted: boolean) => void;
}

export const DeleteAccountModal = ({
  onCloseCallback,
}: DeleteAccountModalProps) => {
  const [isDeleting, setDeleting] = useState(false);
  const dispatch = useDispatch() as AppDispatch;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await dispatch(deleteAccount());
    } catch (e) {
      Alert.alert(
        'Something went wrong',
        `Unable to delete your account. Please contact support for additional help.`,
      );

      setDeleting(false);
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
        loading={isDeleting}
        loadingText={'Deleting account...'}
        disabled={isDeleting}
      />
      <Button
        textOnly
        text={'Back'}
        style={{marginBottom: -10, marginTop: 10}}
        onPress={() => onCloseCallback(false)}
        disabled={isDeleting}
      />
    </>
  );
};
