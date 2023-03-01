import React from 'react';

import {Modal} from '@components';
import {useModal} from '@hooks';

import {SettingsButtonProps, SettingsButton} from './SettingsButton';

interface SettingsHealthActivityButtonProps {
  isLinked: boolean;
  isLoading: boolean;
  onLink: () => Promise<void>;
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
    if (isLinked) {
      handleUnlinkProvider();
    } else {
      onLink();
    }
  };

  return (
    <SettingsButton
      {...rest}
      icon={isLinked ? 'link' : undefined}
      onPress={handleOnPress}
      loading={isLoading}
    />
  );
};
