import axios from 'axios';
import {Share} from 'react-native';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

const DEFAULT_FALLBACK_URL = 'https://bfitcoin.com/';
const DYNAMIC_LINK_URL = 'https://bfitcoin.page.link';
const DYNAMIC_LINK_BASE_URL =
  'https://firebasedynamiclinks.googleapis.com/v1/shortLinks';

type DynamicLinkConfig = {
  link?: string;
};

export async function buildDynamicLink(config?: DynamicLinkConfig) {
  const bundleId = DeviceInfo.getBundleId();
  const response = await axios.post(
    `${DYNAMIC_LINK_BASE_URL}`,
    {
      dynamicLinkInfo: {
        domainUriPrefix: DYNAMIC_LINK_URL,
        link: config?.link ?? DEFAULT_FALLBACK_URL,
        androidInfo: {androidPackageName: bundleId},
        iosInfo: {iosBundleId: bundleId},
      },
    },
    {
      params: {key: Config.FIREBASE_API_KEY},
      headers: {'Content-Type': 'application/json'},
    },
  );

  if (response.status === 200) {
    return response.data.shortLink as string;
  }
}

export async function shareDynamicLink(
  text: string,
  config?: DynamicLinkConfig,
) {
  const dynamicLink = await buildDynamicLink(config);
  if (dynamicLink === undefined) {
    return;
  }

  await Share.share({message: `${text}\n${dynamicLink}`});
}
