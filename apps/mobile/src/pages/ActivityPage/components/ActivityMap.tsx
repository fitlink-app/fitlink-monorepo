import React from 'react';
import {TouchHandler} from '@components';
import {getBounds} from '@utils';
import MapboxGL from '@rnmapbox/maps';
import Polyline from '@mapbox/polyline';
import {useNavigation} from '@react-navigation/core';

const {MapView, LineLayer, ShapeSource, Camera} = MapboxGL;

const MAP_ANIMATION_DURATION = 500;
const MAP_BOUNDS_PADDING = 40;

interface ActivityMapProps {
  polyline: string | undefined;
}

export const ActivityMap = ({polyline}: ActivityMapProps) => {
  const navigation = useNavigation();

  if (!polyline) {
    return null;
  }

  const route = Polyline.toGeoJSON(polyline);
  const polyLatLngs = route.coordinates.map(x => ({
    lat: x[1],
    lng: x[0],
  }));
  const bounds = getBounds(polyLatLngs);

  return (
    <TouchHandler onPress={() => navigation.navigate('Route', {polyline})}>
      <MapView
        style={{height: 316}}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        logoEnabled={false}>
        <Camera
          defaultSettings={{
            animationDuration: MAP_ANIMATION_DURATION,
            bounds: {
              ...bounds,
              paddingLeft: MAP_BOUNDS_PADDING,
              paddingRight: MAP_BOUNDS_PADDING,
              paddingTop: MAP_BOUNDS_PADDING,
              paddingBottom: MAP_BOUNDS_PADDING,
            },
          }}
        />
        <ShapeSource
          id={'route'}
          shape={{
            type: 'Feature',
            geometry: route,
            properties: {},
          }}>
          <LineLayer
            id={'lineroute'}
            style={{
              lineCap: 'round',
              lineWidth: 4.5,
              lineOpacity: 0.84,
              lineColor: '#FB5202',
            }}
          />
        </ShapeSource>
      </MapView>
    </TouchHandler>
  );
};
