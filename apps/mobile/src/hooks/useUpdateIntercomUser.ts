import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useMe} from './api/me/useMe';
import Intercom from '@intercom/intercom-react-native';
import {useEffect, useState} from 'react';

export const useUpdateIntercomUser = () => {
  const [previousUser, setPreviousUser] = useState<User | null>(null);

  const {data: user} = useMe({
    enabled: false,
  });

  useEffect(() => {
    if (!user) return;

    function createIntercomUserPayload(source: User) {
      return {
        email: source.email,
        userId: source.id,
        name: source.name,
        signedUpAt: new Date(source.created_at).valueOf() / 1000,
        customAttributes: {
          rank: source.rank,
          team: source.teams[0]?.name,
        },
      };
    }

    const oldIntercomPayload = previousUser
      ? createIntercomUserPayload(previousUser)
      : null;
    const newIntercomPayload = createIntercomUserPayload(user);

    const didPayloadChange =
      JSON.stringify(oldIntercomPayload) !== JSON.stringify(newIntercomPayload);

    if (didPayloadChange) {
      Intercom.registerIdentifiedUser({
        email: newIntercomPayload.email,
        userId: newIntercomPayload.userId,
      });

      Intercom.updateUser(newIntercomPayload);
      setPreviousUser(user);
    }
  }, [user]);
};
