import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useMe} from './api/me/useMe';
import Intercom from '@intercom/intercom-react-native';

export const useUpdateIntercomUser = () => {
  const {data: user} = useMe({
    enabled: false,
    onSuccess: result => {
      if (!user || !result) return;

      function createIntercomUserPayload(source: User) {
        return {
          email: source.email,
          userId: source.id,
          name: source.name,
          signedUpAt: new Date(source.created_at).valueOf() / 1000,
          customAttributes: {
            rank: source.rank,
          },
        };
      }

      const oldIntercomPayload = createIntercomUserPayload(user);
      const newIntercomPayload = createIntercomUserPayload(result);

      const didPayloadChange =
        JSON.stringify(oldIntercomPayload) !==
        JSON.stringify(newIntercomPayload);

      if (didPayloadChange) {
        Intercom.registerIdentifiedUser({
          email: newIntercomPayload.email,
          userId: newIntercomPayload.userId,
        });
        Intercom.updateUser(newIntercomPayload);
      }
    },
  });
};
