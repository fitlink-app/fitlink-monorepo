import React, {useRef, useState} from 'react';
import {StyleSheet} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {ActivityDetailsModal, ListModal} from './components';
import {useEffect} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Icon} from '@components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFindActivitiesMap} from '@hooks';
import {ActivityForMap} from '@fitlink/api/src/modules/activities/entities/activity.entity';
import {
  getBounds,
  getCenterCoordinate,
  getDistanceFromLatLonInKm,
} from '@utils';
import createCircle from '@turf/circle';

const MAP_MARKER_ICON = require('../../../../assets/images/map/map_marker.png');
const MAP_MARKER_USER_ACTIVITY = require('../../../../assets/images/map/map-marker-user-activity.png');
const MAP_MARKER_ICON_SELECTED = require('../../../../assets/images/map/map_marker_selected.png');

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

  const [selectedMarker, setSelectedMarker] = useState<string>();
  const [selectedClusterIds, setSelectedClusterIds] = useState<string[]>();

  // ref
  const lastListIndex = useRef(0);

  // modal ref
  const listModalRef = useRef<BottomSheetModal>(null);
  const detailsModalRef = useRef<BottomSheetModal>(null);

  // map ref
  const mapViewRef = useRef() as React.MutableRefObject<MapboxGL.MapView>;

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

  const handleOnAddActivityPressed = () => {
    // TODO: Implement method
    console.log('Add activity pressed');
  };

  /**
   * Handle pressing an activity on the list or the map
   * @param id activity id
   * @param isMarker whether the activity was pressed on the modal list or by a marker on the map
   */
  const handleOnActivityPressed = (id: string, isMarker?: boolean) => {
    lastListIndex.current = isMarker ? 0 : 1;

    listModalRef.current?.collapse();
    detailsModalRef.current?.present();
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
      // TODO: Implement cluster mechanism
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
      // TODO: Implement single activity marker mechanism
      const id = feature.properties?.id;

      if (!id) return;

      setSelectedMarker(id);
      zoomToFeatureById(id);
    }
  };

  const updateLocationMarkerValue = (position: GeoJSON.Position) => {
    locationMarkerValue.current = [position[0], position[1]];
    const locationPoint = positionToPoint(position);
    locationMarkerValueAnimated.current.setValue(locationPoint);
  };

  const deselectMarker = () => {
    setSelectedMarker(undefined);
    setSelectedClusterIds(undefined);
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
      zoomLevel: zoomLevel || 17,
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
  const renderAddActivityButton = () => {
    return (
      <AddActivityButtonContainer>
        <IconWrapper>
          <Icon
            onPress={handleOnAddActivityPressed}
            name={'plus'}
            color={colors.accent}
            size={25}
          />
        </IconWrapper>
      </AddActivityButtonContainer>
    );
  };

  const renderControlPanel = () => {
    return (
      <ControlPanel>
        <IconWrapper>
          <Icon
            onPress={handleOnAddActivityPressed}
            name={'location'}
            color={colors.accent}
            size={25}
          />

          <ControlPanelSeparator />

          <Icon
            onPress={handleOnAddActivityPressed}
            name={'search'}
            color={colors.accent}
            size={21}
          />

          <ControlPanelSeparator />

          <Icon
            onPress={handleOnAddActivityPressed}
            name={'my-markers'}
            color={colors.accent}
            size={21}
          />
        </IconWrapper>
      </ControlPanel>
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
        onPress={() => {
          deselectMarker();
        }}>
        {/* Camera */}
        <Camera
          ref={cameraRef}
          animationDuration={1500}
          zoomLevel={12}
          maxZoomLevel={17}
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
            id="selectedMarker"
            style={layerStyles.markerSelected as any}
            filter={['==', 'id', selectedMarker || '']}
          />
        </ShapeSource>

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
        {renderAddActivityButton()}
        {renderControlPanel()}
      </Overlay>

      <ListModal
        ref={listModalRef}
        onActivityPressed={id => handleOnActivityPressed(id)}
        onExpand={() => {}}
      />

      <ActivityDetailsModal
        ref={detailsModalRef}
        onBack={handleOnDetailsBackPressed}
        stackBehavior={'push'}
      />
    </BottomSheetModalProvider>
  );
};
