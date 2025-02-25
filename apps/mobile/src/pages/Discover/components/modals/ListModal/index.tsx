import React, {useCallback, useMemo, useState, useEffect} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from 'redux/store';
import {
  selectQuery,
  selectSearchLocation,
  selectTypes,
  toggleType,
} from 'redux/discover/discoverSlice';
import styled from 'styled-components/native';

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import {useFindActivities} from '@hooks';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';
import {getDistanceFromLatLonInKm, heightLize} from '@utils';

import {getResultsFromPages} from 'utils/api';
import {ActivityItem} from '../components';
import {Search, Filters, ResultsLabel} from './components';
import {BfitSpinner} from '../../../../../components/common/BfitSpinner';

const HANDLE_HEIGHT = 90;

const AboveContentContainer = styled.View({
  paddingHorizontal: 20,
  backgroundColor: '#181818',
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  paddingTop: 10,
});
const {width: SCREEN_WIDTH} = Dimensions.get('screen');

const IndicatorContainer = styled.View({
  width: SCREEN_WIDTH / 5,
  height: 25,
  marginBottom: -15,
  backgroundColor: '#181818',
  borderTopRightRadius: 20,
  borderTopLeftRadius: 20,
  alignSelf: 'center',
});

const FirstIndicator = styled.View({
  alignSelf: 'center',
  width: (0.25 * SCREEN_WIDTH) / 6,
  height: 1,
  borderRadius: 4,
  backgroundColor: '#ACACAC',
  marginTop: 5,
});

const SecondIndicator = styled.View({
  alignSelf: 'center',
  width: (0.4 * SCREEN_WIDTH) / 6,
  height: 1,
  borderRadius: 4,
  backgroundColor: '#ACACAC',
  marginTop: 3,
});
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
  isFetchingMarkers: boolean;
}

export const ListModal = React.forwardRef<BottomSheetModal, ListModalProps>(
  ({onActivityPressed, onExpand, isFetchingMarkers, ...rest}, ref) => {
    const {bottom} = useSafeAreaInsets();
    const dispatch = useDispatch() as AppDispatch;
    const snapPoints = useMemo(
      () => [bottom + HANDLE_HEIGHT + heightLize(72), '90%'],
      [bottom],
    );

    const searchQuery = useSelector(selectQuery);
    const searchTypes = useSelector(selectTypes);
    const searchLocation = useSelector(selectSearchLocation);
    const types = useSelector(selectTypes);

    const {
      refetch,
      data,
      isFetching,
      isFetchingNextPage,
      isFetchedAfterMount,
      fetchNextPage,
    } = useFindActivities({
      type: searchTypes.join(),
      keyword: searchQuery,
      geo_radial: `${searchLocation?.lat},${searchLocation?.lng},15`,
    });

    const [lastSearchQuery, setLastSearchQuery] = useState<string | undefined>(
      undefined,
    );

    const activities =
      isFetching && !isFetchingNextPage
        ? []
        : getResultsFromPages<Activity>(data);

    // Animations
    const animatedPosition = useSharedValue<number>(0);
    const animatedIndex = useSharedValue<number>(0);

    const scrollViewAnimatedStyle = useAnimatedStyle(() => ({
      // opacity: animatedIndex.value,
      backgroundColor: '#181818',
    }));

    const scrollViewStyle = useMemo(
      () => [{flex: 1}, scrollViewAnimatedStyle],
      [scrollViewAnimatedStyle],
    );

    useEffect(() => {
      if (isFetchingMarkers) refetch();
    }, [isFetchingMarkers]);

    useEffect(() => {
      if (searchLocation && !isFetchedAfterMount) handleFetchResults();
    }, [searchLocation]);

    useEffect(() => {
      handleFetchResults();
    }, [types]);

    const handleFetchResults = () => {
      if (!searchLocation) return;
      setLastSearchQuery(searchQuery.trim().length ? searchQuery : undefined);
      refetch();
    };

    const handleLoadMore = () => {
      if (data?.pages && data.pages[0].total > activities.length) {
        fetchNextPage();
      }
    };

    const handleComponent = useCallback(
      () => (
        <>
          <AboveContentContainer>
            <Search onSubmit={handleFetchResults} key={'searchComponent'} />
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
                  ? `Searching For Nearby Activities...`
                  : !!activities.length
                  ? `${data?.pages[0]?.total} Activities Found Nearby ${
                      lastSearchQuery ? `for "${lastSearchQuery}"` : ''
                    }`
                  : `No Nearby Activities Found ${
                      lastSearchQuery ? `For "${lastSearchQuery}"` : ''
                    }`
              }
            />
          </AboveContentContainer>
        </>
      ),
      [data, types, isFetching, lastSearchQuery, searchQuery],
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
          number={index + 1}
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

      return <BfitSpinner wrapperStyle={styles.listEmptyComponent} />;
    };

    const renderListFooterComponent = () => {
      if (!isFetchingNextPage) return null;

      return <BfitSpinner wrapperStyle={styles.listFooterComponent} />;
    };

    return (
      <BottomSheetModal
        {...{...rest, ref}}
        index={0}
        keyboardBehavior={'extend'}
        handleHeight={HANDLE_HEIGHT}
        snapPoints={snapPoints}
        handleComponent={() => (
          <IndicatorContainer>
            <FirstIndicator />
            <SecondIndicator />
          </IndicatorContainer>
        )}
        backgroundComponent={null}
        animatedPosition={animatedPosition}
        animatedIndex={animatedIndex}
        enableDismissOnClose={false}
        enablePanDownToClose={false}
        backdropComponent={renderModalBackdrop}>
        {handleComponent()}

        <BottomSheetFlatList
          {...{renderItem}}
          initialNumToRender={75}
          data={activities}
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

const styles = StyleSheet.create({
  listEmptyComponent: {
    marginTop: 15,
  },
  listFooterComponent: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
