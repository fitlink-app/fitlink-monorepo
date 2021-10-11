import api from '@api';
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
