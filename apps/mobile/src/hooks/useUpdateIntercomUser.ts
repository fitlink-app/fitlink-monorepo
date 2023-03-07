import {useEffect, useState} from 'react';
import Intercom, {UpdateUserParamList} from '@intercom/intercom-react-native';

import {getViewBfitValue} from '@utils';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';

import {useMe, useProviders} from './api';

function createIntercomUserPayload(
  user: User | null,
  providerTypes: ProviderType[] | undefined,
): UpdateUserParamList | null {
  if (user === null) {
    return null;
  }

  const result: UpdateUserParamList = {
    email: user.email,
    userId: user.id,
    name: user.name,
    // TODO: not a good solution
    signedUpAt: new Date(user.created_at).valueOf() / 1000,
    customAttributes: {
      rank: user.rank,
    },
  };

  if (user.teams) {
    result.customAttributes!.team = user.teams[0]?.name;
  }

  if (user.leagues) {
    const serializedLeagues = JSON.stringify(
      user.leagues.map(league => ({
        name: league.name,
        sport: league.sport.name,
      })),
    );
    result.customAttributes!.leagues = serializedLeagues;
  }

  if (providerTypes) {
    result.customAttributes!.trackers = providerTypes.toString();
  }

  if (user.bfit_balance) {
    result.customAttributes!.totalBfit = getViewBfitValue(user.bfit_balance);
  }

  return result;
}

function comparePayloads(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export const useUpdateIntercomUser = () => {
  const [previousUser, setPreviousUser] = useState<User | null>(null);

  const {data: user} = useMe({
    enabled: false,
  });

  const {data: providerTypes} = useProviders();

  useEffect(() => {
    if (!user) {
      return;
    }

    const prevIntercomPayload = createIntercomUserPayload(
      previousUser,
      providerTypes,
    );
    const nextIntercomPayload = createIntercomUserPayload(
      user,
      providerTypes,
    ) as UpdateUserParamList;

    if (!comparePayloads(prevIntercomPayload, nextIntercomPayload)) {
      Intercom.registerIdentifiedUser({
        email: nextIntercomPayload.email,
        userId: nextIntercomPayload.userId,
      });

      Intercom.updateUser(nextIntercomPayload);
      setPreviousUser(user);
    }
  }, [previousUser, user, providerTypes]);
};
