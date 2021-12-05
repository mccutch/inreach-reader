import { DEFAULT_GMAP_BIAS_RADIUS } from '../../constants'

// Set map and autocomplete biasing based on user location
function setLocationBias({ searchBox, map, position}) {
  if (!position) {
    return;
  }
  let pos = position

  let circle = new window.google.maps.Circle({
    center: pos,
    radius: DEFAULT_GMAP_BIAS_RADIUS,
  });
  if (searchBox) {
    searchBox.setBounds(circle.getBounds());
  }
  if (map) {
    map.setCenter(position);
  }
}

//
function convertGeoToPos(geolocation){
  return({
    lat: geolocation.coords.latitude,
    lng: geolocation.coords.longitude,
  });
}

export {
  setLocationBias,
  convertGeoToPos,
}