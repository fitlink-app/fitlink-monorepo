import {Platform} from 'react-native';
import {v4 as uuid} from 'uuid';
import Keychain, {BIOMETRY_TYPE, Options} from 'react-native-keychain';

import {KeychainSupportStorageManager} from '@model';

export const KEYCHAIN_USER = 'user';
export const KEYCHAIN_KEY_USER = 'encryptionKeyUser';
export const KEYCHAIN_KEY_SERVICE = 'encryptionKeyService';

interface IKeychainSetData {
  pin: string;
  biometryType?: BIOMETRY_TYPE | null;
}

export class KeychainService {
  private supportStorage;
  canImplyAuthentication: boolean = true;
  supportedBiometryType: BIOMETRY_TYPE | null = null;

  constructor() {
    this.supportStorage = new KeychainSupportStorageManager();
  }

  async setAuthData({pin, biometryType = null}: IKeychainSetData) {
    await Keychain.resetGenericPassword();

    let keychainOptions: Options = {};

    if (this.supportedBiometryType && biometryType) {
      keychainOptions = {
        accessControl:
          Platform.OS === 'ios'
            ? Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET
            : Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        storage: Keychain.STORAGE_TYPE.RSA,
        authenticationPrompt: {title: 'Authenticate BFIT'},
        authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
      };
      this.supportStorage.setUsedBiometryType(biometryType);
    }

    if (!this.supportedBiometryType || !biometryType) {
      this.supportStorage.deleteUsedBiometryType();
    }

    return this.setCredentials(pin, keychainOptions);
  }

  async getCredentialsWithBiometry(
    authenticationPrompt?: Options['authenticationPrompt'],
  ): Promise<string | undefined> {
    const usedBiometryType = this.supportStorage.getUsedBiometryType();

    if (usedBiometryType) {
      const keychainOptions = this.getKeychainOptions();
      const credentials = await Keychain.getGenericPassword({
        ...keychainOptions,
        authenticationPrompt,
      });

      return credentials ? credentials.password : undefined;
    }
  }

  async resetKeychain() {
    await Keychain.resetGenericPassword();
    await Keychain.resetGenericPassword({service: KEYCHAIN_KEY_SERVICE});
    this.supportStorage.clear();
  }

  getSupportedBiometryType() {
    return this.supportedBiometryType;
  }

  getBiometryType() {
    const biometryType = this.supportStorage.getUsedBiometryType();
    if (!this.supportedBiometryType || !biometryType) {
      return null;
    }
    return biometryType as BIOMETRY_TYPE;
  }

  async getSecureKey() {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_KEY_SERVICE,
    });
    if (credentials) {
      return credentials.password;
    }

    const randomBytesString = uuid();

    await Keychain.setGenericPassword(KEYCHAIN_KEY_USER, randomBytesString, {
      service: KEYCHAIN_KEY_SERVICE,
    });
    return randomBytesString;
  }

  private getKeychainOptions() {
    return this.supportStorage.getKeychainOptions();
  }

  private async setCredentials(pin: string, keychainOptions: Options) {
    await Keychain.resetGenericPassword();
    await Keychain.setGenericPassword(KEYCHAIN_USER, pin, keychainOptions);
    this.supportStorage.setKeychainOptions(keychainOptions);
  }
}
