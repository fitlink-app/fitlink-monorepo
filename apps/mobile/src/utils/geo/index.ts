export type LatLng = {lat: number; lng: number};

export const getCenterCoordinate = (coordinates: LatLng[]) => {
  const lngs = coordinates.map(coordinate => coordinate.lng);
  const lats = coordinates.map(coordinate => coordinate.lat);

  let minLat = Math.min(...lats);
  let minLng = Math.min(...lngs);

  let maxLat = Math.max(...lats);
  let maxLng = Math.max(...lngs);

  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
};

export const getBounds = (coordinates: LatLng[]) => {
  const lngs = coordinates.map(coordinate => coordinate.lng);
  const lats = coordinates.map(coordinate => coordinate.lat);

  let minLat = Math.min(...lats);
  let minLng = Math.min(...lngs);

  let maxLat = Math.max(...lats);
  let maxLng = Math.max(...lngs);

  const bounds = {
    ne: [minLng, minLat],
    sw: [maxLng, maxLat],
  };

  return bounds;
};

export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
