import React, {useEffect, useRef, useState} from 'react';
import {Linking, Switch} from 'react-native';
import {BIOMETRY_TYPE} from 'react-native-keychain';
import {useNavigation} from '@react-navigation/core';
import {StackNavigationProp} from '@react-navigation/stack';

import {RootStackParamList} from '@routes';
import {KeychainService, PinStorageManager} from '@model';

import {SettingsButton} from './SettingsButton';

type NavigationType = StackNavigationProp<RootStackParamList, 'Settings'>;

export const BiometrySettingsButton = () => {
  const navigation = useNavigation<NavigationType>();
  const wasCheckedRef = useRef(false);
  const [currentBiometryType, setCurrentBiometryType] =
    useState<BIOMETRY_TYPE | null>(null);
  const [availableBiometryType, setAvailableBiometryType] =
    useState<BIOMETRY_TYPE | null>(null);

  useEffect(() => {
    KeychainService.getInstance().then(Keychain => {
      setAvailableBiometryType(Keychain.getSupportedBiometryType());
      setCurrentBiometryType(Keychain.getBiometryType());
    });
  }, [wasCheckedRef.current]);

  const toggle = async (checked: boolean) => {
    if (!availableBiometryType) {
      return;
    }
    if (checked) {
      wasCheckedRef.current = true;
      navigation.navigate('EnableBiometryPinCodeScreen');
    } else {
      setCurrentBiometryType(null);
      const PinStorage = await PinStorageManager();
      const pin = (await PinStorage.getPin()) ?? '';
      const Keychain = await KeychainService.getInstance();
      await Keychain.setAuthData({pin});
      wasCheckedRef.current = false;
    }
  };

  const openSettings = () => Linking.openSettings();

  const renderToggle = () => {
    return (
      <Switch
        value={
          currentBiometryType === BIOMETRY_TYPE.FACE_ID ||
          currentBiometryType === BIOMETRY_TYPE.FINGERPRINT ||
          currentBiometryType === BIOMETRY_TYPE.TOUCH_ID ||
          false
        }
        onValueChange={toggle}
      />
    );
  };

  return (
    <SettingsButton
      label={availableBiometryType ? 'Enable biometry' : 'Allow biometry'}
      renderEndAdornment={availableBiometryType ? renderToggle : undefined}
      onPress={availableBiometryType ? renderToggle : openSettings}
    />
  );
};
