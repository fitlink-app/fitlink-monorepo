import React, {useRef, useState} from 'react';
import {Animated, StyleSheet, View, Image} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {ActivityDetailsModal, ListModal} from './components';
import {useEffect} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Icon, Label, TouchHandler} from '@components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFindActivitiesMap} from '@hooks';
import {ActivityForMap} from '@fitlink/api/src/modules/activities/entities/activity.entity';
import {
  getBounds,
  getCenterCoordinate,
  getDistanceFromLatLonInKm,
  LatLng,
} from '@utils';
import createCircle from '@turf/circle';
import {useNavigation} from '@react-navigation/native';

const MAP_MARKER_ICON = require('../../../../assets/images/map/map_marker.png');
const MAP_MARKER_USER_ACTIVITY = require('../../../../assets/images/map/map-marker-user-activity.png');
const MAP_MARKER_ICON_SELECTED = require('../../../../assets/images/map/map_marker_selected.png');

const MAP_MARKER_ICON_HEIGHT = 40;
const MAP_MARKER_ICON_WIDTH = 30;
const MAP_PICKER_ICON_SCALE_MULTIPLIER = 1.25;

const PICKER_ANIMATED_SCALE_MULTIPIER = 1.25;
const PICKER_Y_OFFSET = -60;

const images = {
  MAP_MARKER_ICON,
  MAP_MARKER_ICON_SELECTED,
  MAP_MARKER_USER_ACTIVITY,
};

const {
  MapView,
  Camera,
  UserLocation,
  ShapeSource,
  SymbolLayer,
  Images,
  FillLayer,
  CircleLayer,
} = MapboxGL;

const MAPBOX_BLUE = 'rgba(51, 181, 229, 100)';

const Overlay = styled.View.attrs({
  pointerEvents: 'box-none',
})({
  ...StyleSheet.absoluteFillObject,
});

const IconWrapper = styled.View(({theme: {colors}}) => ({
  backgroundColor: colors.surfaceDark,
  borderRadius: 999,
  padding: 10,
  alignItems: 'center',
  justifyContent: 'center',
}));

const AddActivityButtonContainer = styled.View({
  position: 'absolute',
  top: 0,
  left: 0,
});

const ControlPanel = styled.View({
  position: 'absolute',
  top: 0,
  right: 0,
});

const ControlPanelSeparator = styled.View({height: 10});

const positionToPoint = (coords: GeoJSON.Position) =>
  ({
    type: 'Point',
    coordinates: [coords[0], coords[1]],
  } as GeoJSON.Point);

const createFeatureCollection = (activities: ActivityForMap[]) =>
  activities.map(activity => {
    return {
      type: 'Feature',
      properties: {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        meeting_point: activity.meeting_point,
        date: activity.date,
      },
      geometry: {
        type: 'Point',
        coordinates: [
          (activity.meeting_point as GeoJSON.Point).coordinates[1],
          (activity.meeting_point as GeoJSON.Point).coordinates[0],
        ],
      },
    };
  });

export const Discover = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const geoRadial = {
    lat: '51.752022',
    lng: '-1.257677',
  };

  const SEARCH_RADIUS = 15;

  // state
  const {data: activityMarkersData} = useFindActivitiesMap({
    geo_radial: `${geoRadial.lat},${geoRadial.lng},${SEARCH_RADIUS}`,
  });

  const activityMarkers = activityMarkersData?.results || [];

  const activityMarkerFeatures = createFeatureCollection(activityMarkers);

  // state
  const [selectedMarker, setSelectedMarker] = useState<string>();
  const [selectedClusterIds, setSelectedClusterIds] = useState<string[]>();
  const [modalActivityId, setModalActivityId] = useState<string>();
  const [isAddActivityModeEnabled, setAddActivityModeEnabled] = useState(false);

  // ref
  const lastListIndex = useRef(0);
  const mapMarkerPickerAnimation = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);

  // modal ref
  const listModalRef = useRef<BottomSheetModal>(null);
  const detailsModalRef = useRef<BottomSheetModal>(null);

  // map ref
  const mapViewRef = useRef() as React.MutableRefObject<MapboxGL.MapView>;
  const locationPickerCoordinates = useRef<LatLng>();

  const cameraRef = useRef() as React.MutableRefObject<MapboxGL.Camera>;
  const isCameraAnimatingRef = useRef(false);

  const clusterSourceRef =
    useRef() as React.MutableRefObject<MapboxGL.ShapeSource>;

  const locationMarkerValue = useRef<[number, number]>([
    parseFloat(geoRadial.lng),
    parseFloat(geoRadial.lat),
  ]);
  const locationMarkerValueAnimated = useRef(
    //@ts-ignore
    new MapboxGL.AnimatedPoint(positionToPoint([0, 0])),
  );

  // map settings
  const layerStyles = {
    circle: {
      fillColor: `${colors.accent}1A`,
      fillOutlineColor: `${colors.accent}CC`,
    },
    singlePoint: {
      circleColor: 'green',
      circleOpacity: 0.84,
      circleStrokeWidth: 2,
      circleStrokeColor: 'white',
      circleRadius: 5,
      circlePitchAlignment: 'map',
    },

    clusteredPoints: {
      circlePitchAlignment: 'map',
      circleColor: colors.accent,
      circleRadius: 20,
      circleOpacity: 1,
      circleStrokeWidth: 1,
      circleStrokeOpacity: 1,
      circleStrokeColor: colors.background,
    },
    clusterCount: {
      textField: '{point_count}',
      textSize: 16,
      textPitchAlignment: 'map',
      textColor: 'black',
      textAllowOverlap: true,
      textOffset: [0, -1],
    },
    name: {
      textField: '{name}',
      textSize: 15,
      textFont: ['Lato Bold'],
      textPitchAlignment: 'map',
      textColor: colors.accent,
      textHaloColor: 'black',
      textHaloWidth: 1,
      textHaloBlur: 0,
      textTranslate: [0, -33],
      textJustify: 'center',
      textAnchor: 'bottom',
      textPadding: 15,
    },
    nameSelected: {
      textField: '{name}',
      textSize: 15,
      textFont: ['Lato Bold'],
      textPitchAlignment: 'map',
      textColor: 'black',
      textHaloColor: 'white',
      textHaloWidth: 1,
      textHaloBlur: 0,
      textTranslate: [0, -33],
      textJustify: 'center',
      textAnchor: 'bottom',
      textPadding: 15,
      textAllowOverlap: true,
      textIgnorePlacement: true,
    },
    marker: {
      iconImage: 'MAP_MARKER_ICON',
      iconOffset: [0, -10],
      iconSize: 1,
      iconAllowOverlap: true,
    },

    myActivityMarker: {
      iconImage: 'MAP_MARKER_USER_ACTIVITY',
      iconOffset: [0, -10],
      iconSize: 1,
      iconAllowOverlap: true,
    },
    markerSelected: {
      iconImage: 'MAP_MARKER_ICON_SELECTED',
      iconOffset: [0, -10],
      iconSize: 1,
      iconAllowOverlap: true,
      iconIgnorePlacement: true,
    },
    userLocation: {
      pluse: {
        circleRadius: 15,
        circleColor: MAPBOX_BLUE,
        circleOpacity: 0.2,
        circlePitchAlignment: 'map',
      },
      background: {
        circleRadius: 9,
        circleColor: '#fff',
        circlePitchAlignment: 'map',
      },
      foreground: {
        circleRadius: 6,
        circleColor: MAPBOX_BLUE,
        circlePitchAlignment: 'map',
      },
    },
  };

  useEffect(() => {
    listModalRef.current?.present();
  }, []);

  // Location Picker Animation
  const userPickerLiftAnim = () => {
    if (isDragging.current) return;
    Animated.spring(mapMarkerPickerAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const userPickerDropAnim = () => {
    Animated.spring(mapMarkerPickerAnimation, {
      toValue: 0,
      friction: 2,
      useNativeDriver: true,
    }).start();
  };

  const userPickerScale = mapMarkerPickerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1 * PICKER_ANIMATED_SCALE_MULTIPIER],
  });

  const userPickerTranslate = mapMarkerPickerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      PICKER_Y_OFFSET,
      (PICKER_Y_OFFSET - 2) / PICKER_ANIMATED_SCALE_MULTIPIER,
    ],
  });

  const handleOnCenterCameraPressed = () => {
    centerCamera();
  };

  const setListModalStatus = (open: boolean) => {
    if (open) {
      listModalRef.current?.snapToIndex(0);
    } else {
      listModalRef.current?.close();
    }
  };

  const closeAllModals = () => {
    setListModalStatus(false);
    detailsModalRef.current?.close();
  };

  const handleOnToggleAddActivityModePressed = () => {
    if (!isAddActivityModeEnabled) {
      closeAllModals();
      deselectMarker();
    } else {
      setListModalStatus(true);
    }

    setAddActivityModeEnabled(!isAddActivityModeEnabled);
  };

  const handleOnMyActivitiesPressed = () => {
    setListModalStatus(true);
    deselectMarker();

    navigation.navigate('MyActivities', {
      onAddNewActivityPressed: () => {
        handleOnToggleAddActivityModePressed();
      },
      onActivityPressed: (activityId: string) => {
        handleOnActivityPressed(activityId);
      },
    });
  };

  /**
   * Handle pressing an activity on the list or the map
   * @param id activity id
   * @param isMarker whether the activity was pressed on the modal list or by a marker on the map
   */
  const handleOnActivityPressed = (id: string, isMarker?: boolean) => {
    lastListIndex.current = isMarker ? 0 : 1;

    // CHECK WHETHER THE MARKER FEATURE EXISTS
    const markerExists = !!activityMarkers.find(x => x.id === id);

    selectMarker(markerExists ? id : undefined);
    setModalActivityId(id);

    listModalRef.current?.collapse();
    detailsModalRef.current?.present();
  };

  const handleOnAddActivityContinuePress = () => {
    navigation.navigate('ActivityForm', {
      geo: locationPickerCoordinates.current,
      action: 'create',
      onSubmitCallback: () => {
        setAddActivityModeEnabled(false);
      },
    });
  };

  const handleOnDetailsBackPressed = () => {
    detailsModalRef.current?.close();
    listModalRef.current?.snapToIndex(lastListIndex.current);
  };

  const handleOnUserLocationChange = (location: MapboxGL.Location) => {
    const {latitude, longitude} = location.coords;

    // TODO: implement
    updateLocationMarkerValue([longitude, latitude]);
  };

  const handleOnActivityShapeSourcePress = async (event: any) => {
    const feature = event.features[0];
    deselectMarker();

    if (!!feature.properties?.cluster_id) {
      // If Cluster
      const leaves = await clusterSourceRef.current?.getClusterLeaves(
        feature.properties?.cluster_id,
        feature.properties?.point_count,
        0,
      );

      const clusterActivityIds: string[] = [];

      // @ts-ignore
      for (const feature of leaves.features) {
        clusterActivityIds.push(feature.properties.id);
      }

      // @ts-ignore
      zoomToBounds(leaves.features);
      setSelectedClusterIds(clusterActivityIds);
    } else {
      // If single activity marker
      const id = feature.properties?.id;
      if (!id) return;
      handleOnActivityPressed(id, true);
    }
  };

  const updateLocationMarkerValue = (position: GeoJSON.Position) => {
    locationMarkerValue.current = [position[0], position[1]];
    const locationPoint = positionToPoint(position);
    locationMarkerValueAnimated.current.setValue(locationPoint);
  };

  const selectMarker = (id?: string) => {
    setSelectedMarker(id);
    if (id) zoomToFeatureById(id);
  };

  const deselectMarker = () => {
    setSelectedMarker(undefined);
    setSelectedClusterIds(undefined);
    detailsModalRef.current?.close();
  };

  const zoomToBounds = (features: any[]) => {
    const coords = features.map(feature => ({
      lng: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
    }));

    const bounds = getBounds(coords);

    // Make the camera fit the bounds
    const duration = 500;
    const padding = 140;

    cameraRef.current?.setCamera({
      animationDuration: duration,
      bounds: {
        ...bounds,
        paddingLeft: padding,
        paddingRight: padding,
        paddingTop: padding,
        paddingBottom: padding,
      },
    });
  };

  const zoomToFeature = (feature: GeoJSON.Feature) => {
    // @ts-ignore
    const coordinates = feature.geometry.coordinates;

    moveToCoords({
      longitude: coordinates[0],
      latitude: coordinates[1],
    });
  };

  const zoomToFeatureById = (id: string) => {
    const feature = activityMarkerFeatures.find(
      feature => feature.properties.id === id,
    );

    zoomToFeature(feature as any);
  };

  const moveToCoords = ({
    longitude,
    latitude,
    zoomLevel,
  }: {
    longitude: number;
    latitude: number;
    zoomLevel?: number;
  }) => {
    isCameraAnimatingRef.current = true;

    const duration = 500;

    cameraRef.current?.setCamera({
      animationDuration: duration,
      centerCoordinate: [longitude, latitude],
      zoomLevel: zoomLevel || 18,
    });

    setTimeout(() => {
      isCameraAnimatingRef.current = false;
    }, duration);
  };

  const centerCamera = () => {
    moveToCoords({
      longitude: locationMarkerValue.current[0],
      latitude: locationMarkerValue.current[1],
      zoomLevel: 12,
    });
  };

  // Overlay renderers
  const renderToggleAddActivityModeButton = () => {
    return (
      <AddActivityButtonContainer>
        <IconWrapper>
          {isAddActivityModeEnabled ? (
            <Icon
              onPress={handleOnToggleAddActivityModePressed}
              name={'times'}
              color={colors.accent}
              size={25}
            />
          ) : (
            <Icon
              onPress={handleOnToggleAddActivityModePressed}
              name={'plus'}
              color={colors.accent}
              size={25}
            />
          )}
        </IconWrapper>
      </AddActivityButtonContainer>
    );
  };

  const renderControlPanel = () => {
    return (
      <ControlPanel>
        <IconWrapper>
          <Icon
            onPress={handleOnCenterCameraPressed}
            name={'location'}
            color={colors.accent}
            size={25}
          />

          <ControlPanelSeparator />

          <Icon
            onPress={() => {}}
            name={'search'}
            color={colors.accent}
            size={21}
          />

          <ControlPanelSeparator />

          <Icon
            onPress={handleOnMyActivitiesPressed}
            name={'my-markers'}
            color={colors.accent}
            size={21}
          />
        </IconWrapper>
      </ControlPanel>
    );
  };

  const renderAddActivityOverlay = () => {
    return (
      <View style={{position: 'absolute', bottom: 0, right: 0}}>
        <TouchHandler
          onPress={() => {
            handleOnAddActivityContinuePress();
          }}>
          <IconWrapper>
            <Label appearance={'accent'}>Continue</Label>
          </IconWrapper>
        </TouchHandler>
      </View>
    );
  };

  // Map renderers

  /**
   * Renders the selected cluster's radius
   * @returns
   */
  const renderClusterRadiusMarker = () => {
    if (!selectedClusterIds?.length) return null;

    let radius = 0;

    const selectedActivityMarkers = activityMarkers.filter(activityMarker =>
      selectedClusterIds.includes(activityMarker.id),
    );

    const clusteredActivities = activityMarkers.filter(activity => {
      const selectedGroupActivityIds = selectedActivityMarkers.map(
        activityMarker => activityMarker.id,
      );
      return selectedGroupActivityIds.includes(activity.id);
    });

    const selectedClusterCoordinatesArray = clusteredActivities.map(
      activity => {
        const latLng: GeoJSON.Position = [
          (activity.meeting_point as GeoJSON.Point).coordinates[0],
          (activity.meeting_point as GeoJSON.Point).coordinates[1],
        ];

        return latLng;
      },
    );

    const selectedClusterCoordinate = selectedClusterCoordinatesArray.length
      ? getCenterCoordinate(
          selectedClusterCoordinatesArray.map(x => ({lat: x[0], lng: x[1]})),
        )
      : null;

    if (!selectedClusterCoordinate) return null;

    for (const clusterActivityCoordinate of selectedClusterCoordinatesArray) {
      const dist = getDistanceFromLatLonInKm(
        selectedClusterCoordinate[1],
        selectedClusterCoordinate[0],
        clusterActivityCoordinate[0],
        clusterActivityCoordinate[1],
      );
      radius = Math.max(radius, dist + 0.05);
    }

    let lon = selectedClusterCoordinate[0];
    let lat = selectedClusterCoordinate[1];
    var center = [lon, lat];
    var options = {steps: 50, units: 'kilometers' as any, properties: {}};
    var circle = createCircle(center, radius, options);

    return (
      <ShapeSource id="clusterCircleSource" shape={circle}>
        <FillLayer id="clusterCircleFill" style={layerStyles.circle} />
      </ShapeSource>
    );
  };

  return (
    <BottomSheetModalProvider>
      <MapView
        regionDidChangeDebounceTime={0}
        style={StyleSheet.absoluteFillObject}
        logoEnabled={false}
        ref={mapViewRef}
        onRegionIsChanging={feature => {
          const {coordinates} = feature.geometry;
          locationPickerCoordinates.current = {
            lat: coordinates[0],
            lng: coordinates[1],
          };

          if (isAddActivityModeEnabled) {
            userPickerLiftAnim();
            isDragging.current = true;
            return;
          }
        }}
        onRegionDidChange={feature => {
          if (isAddActivityModeEnabled) {
            isDragging.current = false;
            userPickerDropAnim();
          }
        }}
        onPress={() => {
          deselectMarker();
        }}>
        {/* Camera */}
        <Camera
          ref={cameraRef}
          animationDuration={1500}
          zoomLevel={12}
          maxZoomLevel={22}
          centerCoordinate={[
            parseFloat(geoRadial.lng),
            parseFloat(geoRadial.lat),
          ]}
          followUserLocation={false}
        />

        {/* Images */}
        <Images {...{images}} />

        {/* Cluster Radius */}
        {renderClusterRadiusMarker()}

        {isAddActivityModeEnabled ? null : (
          <>
            {/* Markers */}
            <ShapeSource
              ref={clusterSourceRef}
              hitbox={{width: 1, height: 1}}
              onPress={handleOnActivityShapeSourcePress}
              id="activities"
              cluster
              clusterRadius={25}
              shape={{
                type: 'FeatureCollection',
                features: activityMarkerFeatures as any,
              }}>
              <SymbolLayer
                id="searchResultCluster"
                belowLayerID="pointCount"
                filter={[
                  'all',
                  ['has', 'point_count'],
                  ['!', ['has', 'my-activity']],
                ]}
                style={layerStyles.marker as any}
              />

              <SymbolLayer
                id="myActivityMarker"
                style={layerStyles.myActivityMarker as any}
                filter={[
                  'all',
                  ['!', ['has', 'point_count']],
                  ['has', 'my_activity'],
                ]}
              />

              <SymbolLayer
                id="marker"
                style={layerStyles.marker as any}
                filter={[
                  'all',
                  ['!', ['has', 'point_count']],
                  ['!', ['has', 'my_activity']],
                ]}
              />

              <SymbolLayer
                id="pointCount"
                style={layerStyles.clusterCount as any}
              />

              <SymbolLayer
                id="name"
                style={layerStyles.name as any}
                minZoomLevel={13}
              />
            </ShapeSource>

            {/* Selected Marker */}
            <ShapeSource
              hitbox={{width: 1, height: 1}}
              maxZoomLevel={500}
              id="activitiesSelected"
              shape={{
                type: 'FeatureCollection',
                features: activityMarkerFeatures as any,
              }}>
              <SymbolLayer
                id="selectedMarker"
                style={layerStyles.markerSelected as any}
                filter={['==', 'id', selectedMarker || '']}
              />

              <SymbolLayer
                id="nameSelected"
                style={layerStyles.nameSelected as any}
                filter={['==', 'id', selectedMarker || '']}
              />
            </ShapeSource>
          </>
        )}

        {/* User Location */}
        <MapboxGL.Animated.ShapeSource
          id={'userLocation'}
          shape={locationMarkerValueAnimated.current as any}>
          <CircleLayer
            key="mapboxUserLocationPluseCircle"
            id="mapboxUserLocationPluseCircle"
            style={layerStyles.userLocation.pluse as any}
          />
          <CircleLayer
            key="mapboxUserLocationWhiteCircle"
            id="mapboxUserLocationWhiteCircle"
            style={layerStyles.userLocation.background as any}
          />
          <CircleLayer
            key="mapboxUserLocationBlueCicle"
            id="mapboxUserLocationBlueCicle"
            aboveLayerID="mapboxUserLocationWhiteCircle"
            style={layerStyles.userLocation.foreground as any}
          />
        </MapboxGL.Animated.ShapeSource>
        <UserLocation onUpdate={handleOnUserLocationChange} visible={false} />
      </MapView>

      <Overlay style={{top: insets.top, margin: 10}}>
        {renderToggleAddActivityModeButton()}
        {isAddActivityModeEnabled
          ? renderAddActivityOverlay()
          : renderControlPanel()}

        {isAddActivityModeEnabled ? (
          <View
            pointerEvents={'none'}
            style={{
              top: '50%',
              left: '50%',
              position: 'absolute',
            }}>
            <Animated.View
              style={{
                justifyContent: 'flex-end',
                transform: [
                  {scale: userPickerScale},
                  {translateY: userPickerTranslate},
                ],
                left:
                  -(MAP_MARKER_ICON_WIDTH * MAP_PICKER_ICON_SCALE_MULTIPLIER) /
                  2,
              }}>
              <Image
                source={MAP_MARKER_ICON}
                style={{
                  height:
                    MAP_MARKER_ICON_HEIGHT * MAP_PICKER_ICON_SCALE_MULTIPLIER,
                  width:
                    MAP_MARKER_ICON_WIDTH * MAP_PICKER_ICON_SCALE_MULTIPLIER,
                }}
              />
            </Animated.View>
          </View>
        ) : null}
      </Overlay>

      <ListModal
        ref={listModalRef}
        onActivityPressed={id => handleOnActivityPressed(id)}
      />

      <ActivityDetailsModal
        ref={detailsModalRef}
        onBack={handleOnDetailsBackPressed}
        stackBehavior={'push'}
        activityId={modalActivityId}
      />
    </BottomSheetModalProvider>
  );
};
