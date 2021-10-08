import api from '@api';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {WebhookEventData} from '@fitlink/api/src/modules/providers/types/webhook';

export const syncDeviceActivities = async (data: WebhookEventData) => {
  try {
    await api.post<WebhookEventData>(`providers/webhook`, {
      payload: data,
    });
  } catch (e) {
    console.log(e);
  }
};

export const linkCustomProvider = async (type: ProviderType) => {
  try {
    await api.post(`me/providers`, {
      payload: {type},
    });
  } catch (e) {
    console.log(e);
  }
};
