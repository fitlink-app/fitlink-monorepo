import {Platform} from 'react-native';
import Keychain from 'react-native-keychain';

import {KeychainService as KS} from './KeychainService';

export const KeychainService = (() => {
  let instance: KS | null;
  const getInstance = async () => {
    if (instance) {
      return instance;
    }
    instance = new KS();

    if (Platform.OS === 'ios') {
      instance.canImplyAuthentication = await Keychain.canImplyAuthentication({
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
      });
    }

    if (instance.canImplyAuthentication) {
      instance.supportedBiometryType = await Keychain.getSupportedBiometryType({
        storage: Keychain.STORAGE_TYPE.RSA,
      });
    }

    return instance;
  };
  return {
    getInstance,
  };
})();

export default KeychainService;
