import {Label, Navbar, NAVBAR_HEIGHT, TouchHandler} from '@components';
import {useMe, useNotifications} from '@hooks';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {getResultsFromPages} from 'utils/api';
import {Notification} from './components';
import {Notification as NotificationClass} from '@fitlink/api/src/modules/notifications/entities/notification.entity';
import {queryClient, QueryKeys} from '@query';
import {useNavigation} from '@react-navigation/core';
import {widthLize} from "@utils";

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

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
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

  const clearNotifications = () => {};

  const {refetch: refetchUser} = useMe({enabled: false});

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
      <View
        style={{
          width: '100%',
          height: 50 + insets.top,
          backgroundColor: '#181818',
          borderBottomRightRadius: 31,
          borderBottomLeftRadius: 31,
        }}>
        <Navbar
          iconColor={'white'}
          rightComponent={
            <Row>
              <Label type={'subheading'}>NOTIFICATIONS</Label>
              <TouchHandler
                onPress={() => setNotificationsSeenAll()}
                style={{marginLeft: widthLize(20)}}>
                <Label type={'body'} appearance={'secondary'}>
                  Mark all as seen
                </Label>
              </TouchHandler>
              <TouchHandler
                onPress={() => clearNotifications()}
                style={{marginLeft: 20}}>
                <Label type={'body'} appearance={'secondary'}>
                  Clean
                </Label>
              </TouchHandler>
            </Row>
          }
        />
      </View>

      <FlatList
        {...{renderItem, ListFooterComponent, ListEmptyComponent}}
        data={data}
        contentContainerStyle={{
          minHeight:
            Dimensions.get('window').height - NAVBAR_HEIGHT - insets.top - 20,
          paddingBottom: insets.bottom + 20,
        }}
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
