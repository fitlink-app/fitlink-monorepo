import React, {useEffect, useState} from 'react';
import {Dimensions, FlatList, RefreshControl, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {useNavigation} from '@react-navigation/core';

import {Icon, Label, Navbar, NAVBAR_HEIGHT, BfitSpinner} from '@components';
import {useMe, useNotifications} from '@hooks';
import {queryClient, QueryKeys} from '@query';
import {Notification as NotificationClass} from '@fitlink/api/src/modules/notifications/entities/notification.entity';

import {getResultsFromPages} from 'utils/api';
import {Notification} from './components';

const Wrapper = styled.View({flex: 1});

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
    <BfitSpinner wrapperStyle={styles.loadingContainer} />
  ) : null;

  const ListEmptyComponent = () => {
    return (
      <Flex>
        {isFetching && !isManuallyRefetching ? (
          <BfitSpinner />
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
        iconColor={'white'}
        title="NOTIFICATIONS"
        titleStyle={{
          fontSize: 16,
          letterSpacing: 1,
          color: colors.accent,
        }}
        rightComponent={
          <Icon
            size={22}
            style={{padding: 5, alignItems: 'center', justifyContent: 'center'}}
            fill="white"
            name="double-check"
            onPress={() => setNotificationsSeenAll()}
          />
        }
      />

      <FlatList
        {...{renderItem, ListFooterComponent, ListEmptyComponent}}
        data={data}
        contentContainerStyle={{
          minHeight:
            Dimensions.get('window').height - NAVBAR_HEIGHT - insets.top - 20,
          paddingBottom: insets.bottom + 20,
          marginTop: insets.top + NAVBAR_HEIGHT,
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

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    width: '100%',
  },
});
