import {Modal} from '@components';
import {useModal} from '@hooks';
import {Dialog} from 'components/modal';
import React, {useContext} from 'react';
import {SettingsButtonProps, SettingsButton} from './SettingsButton';

interface SettingsHealthActivityButtonProps {
  isLinked: boolean;
  isLoading: boolean;
  onLink: () => void;
  onUnlink: () => void;
}

export const SettingsHealthActivityButton = ({
  isLoading,
  isLinked,
  onLink,
  onUnlink,
  ...rest
}: SettingsHealthActivityButtonProps &
  Omit<SettingsButtonProps, 'accent' | 'icon' | 'onPress'>) => {
  const {openModal, closeModal} = useModal();

  const handleUnlinkProvider = () => {
    openModal(id => (
      <Modal
        title={`Unlink ${rest.label}`}
        description={`Are you sure you want to unlink ${rest.label} from your account?`}
        buttons={[
          {
            text: 'Unlink',
            onPress: () => {
              closeModal(id);
              onUnlink();
            },
            type: 'danger',
          },
          {
            text: 'Cancel',
            onPress: () => closeModal(id),
          },
        ]}
      />
    ));
  };

  const handleOnPress = () => {
    isLinked ? handleUnlinkProvider() : onLink();
  };

  return (
    <SettingsButton
      {...rest}
      accent={isLinked}
      icon={isLinked ? 'link' : undefined}
      onPress={handleOnPress}
      loading={isLoading}
    />
  );
};
