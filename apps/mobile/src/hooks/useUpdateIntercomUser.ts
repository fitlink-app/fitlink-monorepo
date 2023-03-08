import {useCallback, useEffect, useRef} from 'react';
import Intercom, {UpdateUserParamList} from '@intercom/intercom-react-native';

import {getViewBfitValue} from '@utils';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';

import {useMe, useMyLeagues, useProviders} from './api';
import {getResultsFromPages} from '../utils/api';
import {useFocusEffect} from '@react-navigation/native';

function createIntercomUserPayload(
  user: User | null,
  providerTypes: ProviderType[] | undefined,
  userLeagues: LeaguePublic[] | undefined,
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

  if (user.teams?.length) {
    result.customAttributes!.team = user.teams
      .map(team => team.name)
      .toString();
  }

  if (userLeagues?.length) {
    const serializedLeagues = JSON.stringify(
      userLeagues.map(league => ({
        name: league.name,
        sport: league.sport.name,
      })),
    );
    result.customAttributes!.leagues = serializedLeagues;
  }

  if (providerTypes?.length) {
    result.customAttributes!.trackers = providerTypes.toString();
  }

  if (user.bfit_balance) {
    result.customAttributes!.totalBfit = getViewBfitValue(user.bfit_balance);
  }

  return result;
}

export const useUpdateIntercomUser = () => {
  // TODO: should be done once user passed registration
  const isRegisteredRef = useRef(false);

  const {data: user} = useMe();

  const {data: providerTypes} = useProviders();

  const {data: userLeaguesData} = useMyLeagues();

  const userLeagues = getResultsFromPages(userLeaguesData);

  useEffect(() => {
    if (!isRegisteredRef.current && user) {
      Intercom.registerIdentifiedUser({
        email: user.email,
        userId: user.id,
      });
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        return;
      }

      const nextIntercomPayload = createIntercomUserPayload(
        user,
        providerTypes,
        userLeagues,
      ) as UpdateUserParamList;

      Intercom.updateUser(nextIntercomPayload);
    }, [providerTypes, user, userLeagues]),
  );
};
