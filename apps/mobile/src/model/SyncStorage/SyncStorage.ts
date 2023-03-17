import {MMKV} from 'react-native-mmkv';
import {DocumentDirectoryPath} from 'react-native-fs';

const STORAGE_PATH = `${DocumentDirectoryPath}/BFIT`;

export enum SyncStorageInstanceIds {
  KeychainSupport = 'KeychainSupport',
  PinStorage = 'PinStorage',
}

export class SyncStorage {
  static storages: Partial<Record<SyncStorageInstanceIds, SyncStorage>> = {};
  private readonly storage: MMKV | null = null;

  constructor(instanceId: SyncStorageInstanceIds, encryptionKey?: string) {
    let existingStorage = SyncStorage.storages[instanceId];
    if (existingStorage) {
      return existingStorage;
    }

    this.storage = new MMKV({
      id: instanceId,
      path: STORAGE_PATH,
      encryptionKey,
    });

    SyncStorage.storages[instanceId] = this;
  }

  getBoolean(key: string) {
    const storage = this.storage as MMKV;
    return storage.getBoolean(key);
  }

  getString(key: string) {
    const storage = this.storage as MMKV;
    return storage.getString(key);
  }

  getNumber(key: string) {
    const storage = this.storage as MMKV;
    return storage.getNumber(key);
  }

  getAllKeys() {
    const storage = this.storage as MMKV;
    return storage.getAllKeys();
  }

  setValue(key: string, value: boolean | string | number) {
    const storage = this.storage as MMKV;
    storage.set(key, value);
    return value;
  }

  deleteValue(key: string) {
    const storage = this.storage as MMKV;
    storage.delete(key);
  }

  clear() {
    this.storage?.clearAll();
  }

  recrypt(passcode: string | undefined) {
    const storage = this.storage as MMKV;
    storage.recrypt(passcode);
  }
}

export default SyncStorage;
