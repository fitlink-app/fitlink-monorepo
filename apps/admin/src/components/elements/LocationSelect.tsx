import { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

mapboxgl.accessToken =
  'pk.eyJ1IjoibHVrZS1maXRsaW5rYXBwIiwiYSI6ImNrcTloMjlnZTAwbGwzMHB0emN6aWpzOXQifQ.Z_8_A-whjV_LJv9nHaNNCg'

export type LocationSelectProps = {
  label?: string
  lng?: number
  lat?: number
  onChange?: (lng, lat) => void
}

export default function LocationSelect({
  label,
  lng = -0.08863214657057483,
  lat = 51.513421230466804,
  onChange
}: LocationSelectProps) {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: 15
    })
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    )
    const geocoder = new MapboxGeocoder({
      marker: false,
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    })
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map))
    geocoder.on('result', function (e) {
      if (onChange) {
        onChange(
          e.result.geometry.coordinates[0],
          e.result.geometry.coordinates[1]
        )
      }
      marker.setLngLat([
        e.result.geometry.coordinates[0],
        e.result.geometry.coordinates[1]
      ])
    })

    var marker = new mapboxgl.Marker({
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(map)

    function onDragEnd() {
      var lngLat = marker.getLngLat()
      if (onChange) {
        onChange(lngLat.lng, lngLat.lat)
      }
    }

    marker.on('dragend', onDragEnd)
  }, [])

  const map = (
    <>
      <div className="location-select" id="map"></div>
      <div id="geocoder" className="geocoder"></div>
    </>
  )

  if (label) {
    return (
      <div className="input-block">
        <label htmlFor="map">{label}</label>
        {map}
      </div>
    )
  }
  return map
}
