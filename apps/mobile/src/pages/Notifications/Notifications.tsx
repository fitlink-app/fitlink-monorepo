import {Label, Navbar, NAVBAR_HEIGHT, TouchHandler} from '@components';
import {useMe, useNotifications} from '@hooks';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {getResultsFromPages} from 'utils/api';
import {Notification} from './components';
import {Notification as NotificationClass} from '@fitlink/api/src/modules/notifications/entities/notification.entity';
import {queryClient, QueryKeys} from '@query';
import {useNavigation} from '@react-navigation/core';

const Wrapper = styled.View({flex: 1});

const LoadingContainer = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
  height: 70,
  width: '100%',
});

const Flex = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Notifications = () => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const navigation = useNavigation();

  const [isManuallyRefetching, setIsManuallyRefetching] = useState(false);

  const {
    getNotificationsQuery: {
      data: pages,
      refetch,
      fetchNextPage,
      isFetchingNextPage,
      isFetching,
    },
    setNotificationsSeenQuery: {mutateAsync: setNotificationsSeenById},
    setAllNotificationsSeenQuery: {mutateAsync: setNotificationsSeenAll},
  } = useNotifications();

  const {data: user, refetch: refetchUser} = useMe({enabled: false});

  const data = getResultsFromPages<NotificationClass>(pages);

  useEffect(() => {
    if (data.length) {
      const onBlurListener = navigation.addListener('blur', () => {
        handleOnScreenClosed();
      });

      return () => {
        onBlurListener();
      };
    }
  }, [navigation, data]);

  const handleOnScreenClosed = async () => {
    const ids = data
      .filter(notification => !notification.seen)
      .map(notification => notification.id);

    await setNotificationsSeenById(ids);

    refetchUser();
  };

  const renderItem = ({item}: {item: NotificationClass}) => {
    return <Notification {...{item}} key={item.id} />;
  };

  const ListFooterComponent = isFetchingNextPage ? (
    <LoadingContainer>
      <ActivityIndicator color={colors.accent} />
    </LoadingContainer>
  ) : null;

  const ListEmptyComponent = () => {
    return (
      <Flex>
        {isFetching && !isManuallyRefetching ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Label
            type="body"
            appearance={'accentSecondary'}
            style={{textAlign: 'center'}}>
            You don't have any notifications yet.
          </Label>
        )}
      </Flex>
    );
  };

  return (
    <Wrapper>
      <Navbar
        overlay
        title={'Notifications'}
        rightComponent={
          user?.unread_notifications ? (
            <TouchHandler onPress={() => setNotificationsSeenAll()}>
              <Label type={'caption'} bold appearance={'accent'}>
                Mark all as seen
              </Label>
            </TouchHandler>
          ) : undefined
        }
      />

      <FlatList
        {...{renderItem, ListFooterComponent, ListEmptyComponent}}
        data={data}
        contentContainerStyle={{
          minHeight:
            Dimensions.get('window').height - NAVBAR_HEIGHT - insets.top - 20,
          paddingTop: Platform.OS === 'ios' ? 0 : NAVBAR_HEIGHT + insets.top,
          paddingBottom: insets.bottom + 20,
        }}
        contentInset={{top: NAVBAR_HEIGHT + insets.top}}
        contentOffset={{x: 0, y: -(NAVBAR_HEIGHT + insets.top)}}
        onEndReached={() => fetchNextPage()}
        onEndReachedThreshold={0.25}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={isManuallyRefetching}
            progressViewOffset={NAVBAR_HEIGHT}
            onRefresh={async () => {
              setIsManuallyRefetching(true);

              queryClient.setQueryData(QueryKeys.Notifications, (data: any) => {
                return {
                  pages: data.pages.length ? [data.pages[0]] : data.pages,
                  pageParams: data.pageParams.length
                    ? [data.pageParams[0]]
                    : data.pageParams,
                };
              });

              await refetch();
              setIsManuallyRefetching(false);
            }}
          />
        }
      />
    </Wrapper>
  );
};
