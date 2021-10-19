import api from '@api';
import {WebhookEventData} from '@fitlink/api/src/modules/providers/types/webhook';
import {RecreateGoalsEntryDto} from '@fitlink/api/src/modules/goals-entries/dto/update-goals-entry.dto';

export const syncDeviceActivities = async (data: WebhookEventData) => {
  try {
    await api.post<WebhookEventData>(`providers/webhook`, {
      payload: data,
    });
  } catch (e) {
    console.log(e);
  }
};

export const syncDeviceLifestyleData = async (data: RecreateGoalsEntryDto) => {
  try {
    await api.post<WebhookEventData>(`me/goals`, {
      payload: data,
    });
  } catch (e) {
    console.log(e);
  }
};
