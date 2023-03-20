import {KeychainService, SyncStorage, SyncStorageInstanceIds} from '@model';

const PIN = 'pin';

export const PinStorageManager = async () => {
  const Keychain = await KeychainService.getInstance();
  const encryptionKey = await Keychain.getSecureKey();

  const storage = new SyncStorage(
    SyncStorageInstanceIds.PinStorage,
    encryptionKey,
  );

  const setPin = async (pin: string) => {
    storage.setValue(PIN, pin);
  };

  const hasPin = () => {
    return Boolean(storage.getString(PIN));
  };

  const getPin = async () => {
    return storage.getString(PIN);
  };

  const clean = () => {
    storage.clear();
  };

  return {
    setPin,
    hasPin,
    getPin,
    clean,
  };
};

export default PinStorageManager;
