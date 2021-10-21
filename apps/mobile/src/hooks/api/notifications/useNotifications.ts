import {useInfiniteQuery, useMutation, InfiniteData} from 'react-query';
import {queryClient, QueryKeys} from '@query';
import api from '@api';
import {Notification} from '@fitlink/api/src/modules/notifications/entities/notification.entity';
import {getNextPageParam, getResultsFromPages} from 'utils/api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

const limit = 20;

const fetchNotifications = ({
  pageParam = 0,
}: {
  pageParam?: number | undefined;
}) =>
  api.list<Notification>(`/me/notifications`, {
    page: pageParam,
    limit,
  });

export const useNotifications = () => {
  const getNotificationsQuery = useInfiniteQuery<
    ListResponse<Notification>,
    Error
  >(QueryKeys.Notifications, ({pageParam}) => fetchNotifications({pageParam}), {
    getNextPageParam: getNextPageParam(limit),
  });

  const setNotificationsSeenQuery = useMutation(
    (notificationIds: string[]) =>
      api.put(`/me/notifications/seen`, {payload: {notificationIds}} as any),
    {
      onMutate: ids => {
        queryClient.setQueryData<InfiniteData<ListResponse<Notification>>>(
          QueryKeys.Feed,
          oldFeedItems => setNotificationsSeenById(oldFeedItems, ids),
        );

        queryClient.setQueryData<User>(QueryKeys.Me, oldUser => {
          return {
            ...oldUser!,
            unread_notifications: oldUser!.unread_notifications - ids.length,
          };
        });
      },
    },
  );

  const setAllNotificationsSeenQuery = useMutation(
    () => api.put(`/me/notifications/seen-all`),
    {
      onMutate: () => {
        queryClient.setQueryData<User>(QueryKeys.Me, oldUser => ({
          ...oldUser!,
          unread_notifications: 0,
        }));

        queryClient.setQueryData<User>(QueryKeys.Me, oldUser => {
          return {
            ...oldUser!,
            unread_notifications: 0,
          };
        });
      },
    },
  );

  return {
    getNotificationsQuery,
    setNotificationsSeenQuery,
    setAllNotificationsSeenQuery,
  };
};

function setNotificationsSeenById(
  oldFeedItems: InfiniteData<ListResponse<Notification>> | undefined,
  ids: string[],
): InfiniteData<ListResponse<Notification>> {
  const newFeedItems = JSON.parse(JSON.stringify(oldFeedItems)) as
    | InfiniteData<ListResponse<Notification>>
    | undefined;

  const notifications = getResultsFromPages<Notification>(newFeedItems);
  const results = notifications?.filter(notification =>
    ids.includes(notification.id),
  );

  for (const result of results) {
    console.log('here');
    console.log(result);
    result.seen = true;
  }

  return newFeedItems as InfiniteData<ListResponse<Notification>>;
}
