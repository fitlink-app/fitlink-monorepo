import AsyncStorage from '@react-native-async-storage/async-storage';

export async function persistData(key: string, data?: any) {
  if (data) {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } else {
    await AsyncStorage.removeItem(key);
  }
}

export async function getPersistedData<T>(key: string) {
  const dataString = await AsyncStorage.getItem(key);
  const data = dataString ? (JSON.parse(dataString) as T) : undefined;
  return data;
}

export async function clearData(key: string) {
  return AsyncStorage.removeItem(key);
}

export * from './constants';
