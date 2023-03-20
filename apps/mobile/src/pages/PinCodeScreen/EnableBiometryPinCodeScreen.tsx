import React, {useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/core';
import {BIOMETRY_TYPE} from 'react-native-keychain';
import styled from 'styled-components/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {KeychainService} from '@model';
import {PinCodeWrapper} from '@components';
import {RootStackParamList} from '@routes';

type NavigationType = StackNavigationProp<
  RootStackParamList,
  'EnableBiometryPinCodeScreen'
>;

export const EnableBiometryPinCodeScreen = () => {
  const navigation = useNavigation<NavigationType>();
  const availableBiometryTypeRef = useRef<BIOMETRY_TYPE | null>(null);

  useEffect(() => {
    KeychainService.getInstance().then(Keychain => {
      availableBiometryTypeRef.current = Keychain.getSupportedBiometryType();
    });
  }, []);

  const enableBiometry = async ({pin}: {pin: string}) => {
    const Keychain = await KeychainService.getInstance();

    try {
      if (!pin) {
        return;
      }
      if (!availableBiometryTypeRef.current) {
        await Keychain.setAuthData({pin});
        return;
      }
      await Keychain.setAuthData({
        pin,
        biometryType: availableBiometryTypeRef.current,
      });
      await Keychain.getCredentialsWithBiometry({
        title: 'BFIT needs your allowance',
        subtitle: 'to enable biometry',
      });
      navigation.goBack();
    } catch (e) {
      console.error('enableBiometry', e);
      await Keychain.setAuthData({pin});
    }
  };

  return (
    <SWrapper>
      <PinCodeWrapper
        useBiometry={false}
        onSuccess={enableBiometry}
        title="Enter pin code to enable biometry"
      />
    </SWrapper>
  );
};

const SWrapper = styled.SafeAreaView({
  flex: 1,
  paddingHorizontal: 18,
});

export default EnableBiometryPinCodeScreen;
