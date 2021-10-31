import api from '@api';
import {WebhookEventData} from '@fitlink/api/src/modules/providers/types/webhook';
import {RecreateGoalsEntryDto} from '@fitlink/api/src/modules/goals-entries/dto/update-goals-entry.dto';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {Provider} from '@fitlink/api/src/modules/providers/entities/provider.entity';
import {Platform} from 'react-native';
import {AppleHealthKitWrapper, GoogleFitWrapper} from 'services';

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

export const syncAllPlatformActivities = async () => {
  if (Platform.OS === 'android') {
    await GoogleFitWrapper.syncAllWithBackend();
  } else if (Platform.OS === 'ios') {
    await AppleHealthKitWrapper.syncAllWithBackend();
  }
};

export const fetchProviderList = async (): Promise<ProviderType[]> => {
  const data = await api.get<Provider[]>('/me/providers');
  const providerList = data.map(provider => provider.type as ProviderType);
  return providerList;
};
