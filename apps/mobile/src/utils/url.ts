import {Linking} from 'react-native';

export const openUrl = async (url?: string | null | undefined) => {
  if (!url) {
    console.warn('openUrl: Empty url provided');
    return;
  }
  try {
    await Linking.openURL(url);
  } catch (e) {
    console.error('openUrl', e);
  }
};
