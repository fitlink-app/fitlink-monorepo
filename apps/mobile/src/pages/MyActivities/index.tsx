import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {
  selectQuery,
  selectSearchLocation,
  selectTypes,
} from 'redux/discover/discoverSlice';
import {useSelector} from 'react-redux';

import {useNavigation} from '@react-navigation/core';
import {StackScreenProps} from '@react-navigation/stack';

import {
  Button,
  Label,
  Modal,
  Navbar,
  NAVBAR_HEIGHT,
  Swipeable,
  SwipeableButton,
} from '@components';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';

import {RootStackParamList} from 'routes/types';
import {useDeleteActivity, useModal, useFindActivities} from '@hooks';
import {getResultsFromPages} from 'utils/api';
import {ActivityItem} from './components';
import {BfitSpinner} from '../../components/common/BfitSpinner';

const LOADING_NEXT_PAGE_BOTTOM_INDICATOR_HEIGHT = 60;

const Wrapper = styled.View({flex: 1});

const EmptyContainer = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
  height: LOADING_NEXT_PAGE_BOTTOM_INDICATOR_HEIGHT,
});

const BottomSeparator = styled.View({
  height: 1,
  marginHorizontal: 20,
  backgroundColor: 'rgba(86, 86, 86, 1)',
});

export const MyActivities = (
  props: StackScreenProps<RootStackParamList, 'MyActivities'>,
) => {
  const {onAddNewActivityPressed, onActivityPressed} = props.route.params;

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  const {openModal, closeModal} = useModal();

  const scrollViewPaddingTop = NAVBAR_HEIGHT + insets.top;

  const searchQuery = useSelector(selectQuery);
  const searchTypes = useSelector(selectTypes);
  const searchLocation = useSelector(selectSearchLocation);

  const {
    data,
    isFetching,
    isFetchedAfterMount,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
  } = useFindActivities({
    type: searchTypes.join(),
    keyword: searchQuery,
    geo_radial: `${searchLocation?.lat},${searchLocation?.lng},15`,
  });

  const {mutateAsync: deleteActivity} = useDeleteActivity();

  const activities = getResultsFromPages(data);

  const handleDelete = (activityId: string, onClose?: () => void) => {
    openModal(
      id => {
        return (
          <Modal
            title={'Are you sure you want to delete this activity?'}
            description={'Are you sure you want to delete this activity?'}
            buttons={[
              {
                text: 'Delete',
                type: 'danger',
                onPress: () => {
                  closeModal(id, () => {
                    // Deleted
                  });

                  deleteActivity(activityId);
                },
              },
              {
                text: 'Back',
                textOnly: true,
                onPress: () => closeModal(id),
              },
            ]}
          />
        );
      },
      () => {
        onClose && onClose();
      },
    );
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    fetchNextPage();
  };

  const handleActivitypressed = (activity: Activity) => {
    //@ts-ignore
    const coordinates = activity.meeting_point.coordinates;

    const geo = {
      lat: coordinates[1],
      lng: coordinates[0],
    };
    navigation.navigate('ActivityForm', {
      geo,
      action: 'edit',
      data: activity,
      onDelete: handleDelete,
    });
  };

  const renderItem = ({item}: {item: Activity}) => {
    return (
      <Swipeable
        buttonWrapperColor={'white'}
        contentBackgroundColor={colors.card}
        bottomSeparator={<BottomSeparator />}
        rightComponent={closeSwipeable => {
          return (
            <View style={{flexDirection: 'row'}}>
              <SwipeableButton
                onPress={() => {
                  handleActivitypressed(item);

                  setTimeout(() => {
                    closeSwipeable();
                  }, 175);
                }}
                icon={'pencil'}
                iconColor={'white'}
                text={'Edit'}
                hideSeparator
                style={{
                  backgroundColor: '#03AFE5',
                }}
              />

              <SwipeableButton
                onPress={() => {
                  closeSwipeable();
                  handleDelete(item.id);
                }}
                icon={'trash'}
                iconColor={'white'}
                text={'Delete'}
                style={{
                  backgroundColor: '#D32F2F',
                }}
              />
            </View>
          );
        }}
        height={74}
      >
        <ActivityItem
          {...{item}}
          onPress={() => {
            navigation.goBack();
            onActivityPressed(item.id);
          }}
        />
      </Swipeable>
    );
  };

  const renderListFooter = () => {
    if (!activities.length && isFetchedAfterMount)
      return (
        <EmptyContainer style={{paddingVertical: 10}}>
          <Label>You don't have any activities created yet.</Label>
        </EmptyContainer>
      );

    if (isFetchingNextPage)
      return <BfitSpinner wrapperStyle={styles.loadingWrapper} />;

    return null;
  };

  const refreshControl = (
    <RefreshControl
      progressViewOffset={insets.top}
      style={{...Platform.select({ios: {zIndex: 10}})}}
      refreshing={isFetching && !isFetchingNextPage}
      onRefresh={handleRefresh}
      tintColor={colors.accent}
      colors={[colors.accent]}
    />
  );

  const keyExtractor = (item: Activity) => item.id;

  return (
    <Wrapper>
      {!activities.length && !isFetchedAfterMount ? (
        <BfitSpinner wrapperStyle={styles.loadingWrapper} />
      ) : (
        <FlatList
          {...{refreshControl, keyExtractor}}
          initialNumToRender={20}
          onEndReachedThreshold={0.1}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          ListFooterComponent={renderListFooter}
          style={{
            marginTop: Platform.select({
              android: 90,
              ios: scrollViewPaddingTop,
            }),
            overflow: 'visible',
          }}
          contentContainerStyle={{
            marginTop: 20,
            paddingTop: Platform.select({
              android: 20,
              ios: 0,
            }) as number,
            paddingBottom:
              insets.bottom + LOADING_NEXT_PAGE_BOTTOM_INDICATOR_HEIGHT,
            marginHorizontal: 20,
            backgroundColor: colors.card,
            borderRadius: 31,
            overflow: 'hidden',
          }}
          data={activities}
          renderItem={renderItem}
        />
      )}

      <Navbar
        title={'MY ACTIVITIES'}
        overlay
        rightComponent={
          <View style={{alignItems: 'flex-end'}}>
            <Button
              text="Add"
              textStyle={{
                fontFamily: 'Roboto',
                fontSize: 14,
                fontWeight: '700',
              }}
              containerStyle={{
                width: 66,
                height: 26,
                backgroundColor: '#ACACAC',
              }}
              onPress={() => {
                onAddNewActivityPressed();
                navigation.goBack();
              }}
            />
          </View>
        }
        titleStyle={{
          fontSize: 15,
          letterSpacing: 1,
          color: colors.accent,
        }}
        iconColor={colors.text}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  loadingWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: LOADING_NEXT_PAGE_BOTTOM_INDICATOR_HEIGHT,
  },
});
