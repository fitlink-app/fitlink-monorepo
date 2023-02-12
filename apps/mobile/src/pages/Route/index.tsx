import {StackScreenProps} from '@react-navigation/stack';
import Polyline from '@mapbox/polyline';
import {getBounds} from '../../utils/geo';
import React, {useRef} from 'react';
import MapboxGL from '@rnmapbox/maps';
import {useNavigation} from '@react-navigation/core';
import {RootStackParamList} from 'routes/types';
import {Navbar} from '@components';

const {
  MapView,
  LineLayer,
  ShapeSource,
  Camera,
  UserLocation,
  SymbolLayer,
  Images,
} = MapboxGL;

// Make the camera fit the bounds
const MAP_ANIMATION_DURATION = 500;
const MAP_BOUNDS_PADDING = 120;

const startMarker = require('../../../assets/images/map/start.png');
const finishMarker = require('../../../assets/images/map/finish.png');

const mapStyles = {
  lineRoute: {
    lineCap: 'round',
    lineWidth: 4.5,
    lineOpacity: 0.84,
    lineColor: '#FB5202',
  },
  startPointMarker: {
    iconImage: 'startMarker',
    iconSize: 0.9,
    iconAllowOverlap: true,
  },
  finishPointMarker: {
    iconImage: 'finishMarker',
    iconSize: 1,
    iconAllowOverlap: true,
  },
};

export const Route = (props: StackScreenProps<RootStackParamList, 'Route'>) => {
  const navigation = useNavigation();
  const {polyline} = props.route.params;

  const mapViewRef = useRef() as React.MutableRefObject<MapboxGL.MapView>;
  const cameraRef = useRef() as React.MutableRefObject<MapboxGL.Camera>;

  const route = Polyline.toGeoJSON(polyline);
  const polyLatLngs = route.coordinates.map(x => ({
    lat: x[1],
    lng: x[0],
  }));

  const bounds = getBounds(polyLatLngs);

  // Marker coords
  const start = polyLatLngs[0];
  const finish = polyLatLngs[polyLatLngs.length - 1];

  // Marker images
  const images = {startMarker, finishMarker};

  return (
    <>
      <MapView style={{flex: 1}} ref={mapViewRef} logoEnabled={false}>
        <Camera
          ref={cameraRef}
          defaultSettings={{
            animationDuration: MAP_ANIMATION_DURATION,
            bounds: {
              ...bounds,
              paddingLeft: MAP_BOUNDS_PADDING,
              paddingRight: MAP_BOUNDS_PADDING,
              paddingTop: MAP_BOUNDS_PADDING + 60,
              paddingBottom: MAP_BOUNDS_PADDING,
            },
          }}
        />

        <UserLocation animated showsUserHeadingIndicator />

        <ShapeSource
          id={'route'}
          shape={{
            type: 'Feature',
            geometry: route,
            properties: {},
          }}>
          <LineLayer id={'lineroute'} style={mapStyles.lineRoute as any} />
        </ShapeSource>

        <Images {...{images}} />

        <ShapeSource
          hitbox={{width: 1, height: 1}}
          id="startPointMarkerSource"
          shape={{
            type: 'Point',
            coordinates: [start.lng, start.lat],
          }}>
          <SymbolLayer
            id="startPointMarker"
            style={mapStyles.startPointMarker as any}
          />
        </ShapeSource>

        <ShapeSource
          hitbox={{width: 1, height: 1}}
          id="finishPointMarkerSource"
          shape={{
            type: 'Point',
            coordinates: [finish.lng, finish.lat],
          }}>
          <SymbolLayer
            id="finishPointMarker"
            style={mapStyles.finishPointMarker as any}
          />
        </ShapeSource>
      </MapView>

      <Navbar title={'Activity Route'} overlay />
    </>
  );
};
