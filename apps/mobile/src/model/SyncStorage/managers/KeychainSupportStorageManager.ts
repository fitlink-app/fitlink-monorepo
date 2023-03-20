import {BIOMETRY_TYPE, Options} from 'react-native-keychain';

import {SyncStorage, SyncStorageInstanceIds} from '@model';

const KEYCHAIN_OPTIONS_STORAGE = 'keychainOptions';
const USED_BIOMETRY_TYPE = 'usedBiometryType';

export class KeychainSupportStorageManager {
  private store;

  constructor() {
    this.store = new SyncStorage(SyncStorageInstanceIds.KeychainSupport);
  }

  public getKeychainOptions(): Options {
    const JSONOptions = this.store.getString(KEYCHAIN_OPTIONS_STORAGE);
    if (JSONOptions) {
      return JSON.parse(JSONOptions);
    }
    return {};
  }

  public setKeychainOptions(options: Options) {
    this.store.setValue(KEYCHAIN_OPTIONS_STORAGE, JSON.stringify(options));
  }

  public getUsedBiometryType() {
    return this.store.getString(USED_BIOMETRY_TYPE) as
      | BIOMETRY_TYPE
      | undefined;
  }

  public setUsedBiometryType(type: BIOMETRY_TYPE) {
    this.store.setValue(USED_BIOMETRY_TYPE, type);
  }

  public deleteUsedBiometryType() {
    this.store.deleteValue(USED_BIOMETRY_TYPE);
  }

  public clear() {
    this.store.clear();
  }
}
