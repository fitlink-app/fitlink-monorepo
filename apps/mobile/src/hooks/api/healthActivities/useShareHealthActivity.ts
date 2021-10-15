import RNFetchBlob from 'rn-fetch-blob';
import {useState} from 'react';
import Config from 'react-native-config';
import api from '@api';
import Share from 'react-native-share';

type GenerateShareableActivityImagePayload = {
  activityId: string;
  imageId?: string;
};

export function useShareHealthActivity() {
  const [isLoading, setLoading] = useState(false);

  async function generateShareableActivityImage({
    activityId,
    imageId,
  }: GenerateShareableActivityImagePayload) {
    const baseUrl = Config.API_URL;

    const {access_token} = api.getTokens();

    // send http request in a new thread (using native code)
    const response = await RNFetchBlob.fetch(
      'POST',
      `${baseUrl}me/health-activities/${activityId}/share/`,
      {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      JSON.stringify({imageId}),
    );

    const status = response.info().status;

    if (status == 200) {
      // the conversion is done in native code
      let base64Str = response.base64();
      if (base64Str) return `data:image/jpeg;base64,${base64Str}`;
      throw Error('Something went wrong while generating image string.');
    } else {
      throw Error(`Unable to generate activity image. Status: ${status}`);
    }
  }

  async function shareActivity(payload: GenerateShareableActivityImagePayload) {
    setLoading(true);

    try {
      const image = await generateShareableActivityImage(payload);

      const shareOptions = {
        title: 'Health Activity',
        url: image,
      };

      await Share.open(shareOptions);
    } catch (e: any) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  return {
    shareActivity,
    isLoading,
  };
}
