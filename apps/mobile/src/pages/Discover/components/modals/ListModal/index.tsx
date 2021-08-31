import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import {useFindActivities} from '@hooks';
import React, {useCallback, useMemo} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import {getResultsFromPages} from 'utils/api';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';
import {ActivityItem, Handle, ModalBackground} from '../components';
import {Search, Filters, ResultsLabel} from './components';
import {getDistanceFromLatLonInKm} from '@utils';
import {useDispatch, useSelector} from 'react-redux';
import {selectTypes, toggleType} from 'redux/discover/discoverSlice';
import {AppDispatch} from 'redux/store';

const HANDLE_HEIGHT = 80;

const AboveContentContainer = styled.View({paddingHorizontal: 16});

interface ListModalProps
  extends Omit<
    BottomSheetModalProps,
    | 'children'
    | 'snapPoints'
    | 'index'
    | 'handleHeight'
    | 'enablePanDownToClose'
    | 'backgroundComponent'
    | 'backdropComponent'
  > {
  onActivityPressed: (id: string) => void;
  onExpand?: () => void;
}

export const ListModal = React.forwardRef<BottomSheetModal, ListModalProps>(
  ({onActivityPressed, onExpand, ...rest}, ref) => {
    const {colors} = useTheme();
    const dispatch = useDispatch() as AppDispatch;
    const snapPoints = useMemo(() => [HANDLE_HEIGHT, '90%'], []);

    const geoRadial = {
      lat: '51.752022',
      lng: '-1.257677',
    };

    const SEARCH_RADIUS = 15;

    const {data, isFetching, isFetchingNextPage, fetchNextPage} =
      useFindActivities({
        type: '',
        keyword: '',
        geo_radial: `${geoRadial.lat},${geoRadial.lng},${SEARCH_RADIUS}`,
      });

    const activities = getResultsFromPages<Activity>(data);

    // Animations
    const animatedPosition = useSharedValue<number>(0);
    const animatedIndex = useSharedValue<number>(0);

    const scrollViewAnimatedStyle = useAnimatedStyle(() => ({
      opacity: animatedIndex.value,
    }));

    const scrollViewStyle = useMemo(
      () => [{flex: 1}, scrollViewAnimatedStyle],
      [scrollViewAnimatedStyle],
    );

    const types = useSelector(selectTypes);

    const handleLoadMore = () => {
      if (data?.pages && data.pages[0].total > activities.length) {
        fetchNextPage();
      }
    };

    const handleComponent = useCallback(
      () => (
        <>
          <Handle />
          <AboveContentContainer>
            <Search />
            <Filters
              {...{types}}
              onTypePressed={type => {
                // disable type
                dispatch(toggleType(type));
              }}
            />
            <ResultsLabel
              text={
                isFetching
                  ? `Searching for nearby activities...`
                  : !!activities.length
                  ? `${data?.pages[0]?.total} activities found nearby`
                  : 'No nearby activities found'
              }
            />
          </AboveContentContainer>
        </>
      ),
      [data, types, isFetching],
    );

    const renderModalBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          pressBehavior={'collapse'}
          enableTouchThrough={true}
          appearsOnIndex={2}
          disappearsOnIndex={1}
        />
      ),
      [],
    );

    const renderItem = ({item, index}: {item: Activity; index: number}) => {
      // TODO: Use actual user location
      const userLocation = {lat: 51.752022, lng: -1.257677};

      const dist = getDistanceFromLatLonInKm(
        //@ts-ignore
        item.meeting_point.coordinates[0],
        //@ts-ignore
        item.meeting_point.coordinates[1],
        userLocation?.lat,
        userLocation?.lng,
      );

      let distanceString = '';

      if (dist >= 1) {
        // km
        const value = dist >= 1000 ? dist.toFixed(0) : dist.toFixed(1);
        distanceString = `${value} km away`;
      } else {
        // meter
        const value = (dist * 1000).toFixed(0);
        distanceString = `${value} meters away`;
      }

      return (
        <ActivityItem
          key={item.name + index}
          onPress={() => onActivityPressed(item.id)}
          name={item.name}
          activityType={item.activity}
          distance={distanceString}
          date={item.date}
        />
      );
    };

    const renderListEmptyComponent = () => {
      if (!isFetching) return null;

      return (
        <View
          style={{
            marginTop: 15,
          }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    };

    const renderListFooterComponent = () => {
      if (!isFetchingNextPage) return null;

      return (
        <View
          style={{height: 80, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    };

    return (
      <BottomSheetModal
        {...{...rest, ref, handleComponent}}
        index={0}
        handleHeight={HANDLE_HEIGHT}
        snapPoints={snapPoints}
        animatedPosition={animatedPosition}
        animatedIndex={animatedIndex}
        enableDismissOnClose={false}
        enablePanDownToClose={false}
        backgroundComponent={ModalBackground}
        backdropComponent={renderModalBackdrop}>
        <BottomSheetFlatList
          {...{renderItem}}
          initialNumToRender={75}
          data={activities}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
          style={scrollViewStyle}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
          }}
          ListEmptyComponent={renderListEmptyComponent}
          ListFooterComponent={renderListFooterComponent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.25}
        />
      </BottomSheetModal>
    );
  },
);
