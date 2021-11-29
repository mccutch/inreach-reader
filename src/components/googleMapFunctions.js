import {
  DEFAULT_MAP_CENTER,
  DEFAULT_LINE_COLOUR,
  STROKE_WEIGHT,
  DEFAULT_GMAP_ZOOM,
  DEFAULT_GMAP_BIAS_RADIUS,
} from "../constants.js";

// Use search input to position the map and return a marker
function setMapToSearchInput({ searchBox, map, onNotFound }) {
  let place = searchBox.getPlace();
  console.log(place);
  if (!place.geometry) {
    onNotFound(place.name);
    return null;
  }
  map.setCenter(place.geometry.location);
  let temporaryMarker = new window.google.maps.Marker({
    position: place.geometry.location,
    map: map,
    title: place.name,
  });
  map.setZoom(DEFAULT_GMAP_ZOOM);
  return temporaryMarker;
}

// Set map and autocomplete biasing based on user location
function setLocationBias({ searchBox, map, position, geolocation }) {
  if (!(position || geolocation)) {
    return;
  }
  let pos = position
    ? position
    : {
        lat: parseFloat(geolocation.coords.latitude),
        lng: parseFloat(geolocation.coords.latitude),
      };

  let circle = new window.google.maps.Circle({
    center: pos,
    radius: DEFAULT_GMAP_BIAS_RADIUS,
  });
  if (searchBox) {
    searchBox.setBounds(circle.getBounds());
  }
  if (map) {
    map.setCenter(geolocation);
  }
}

// Set map bounds to include all points
function setMapBounds({ map, points, locationBias }) {
  if (points.length <= 1) {
    map.setCenter(
      points[0] ? points[0] : locationBias ? locationBias : DEFAULT_MAP_CENTER
    );
    return;
  }
  let bounds = new window.google.maps.LatLngBounds();
  for (const point of points) {
    bounds.extend(point);
  }
  map.fitBounds(bounds);
}

// Add path to Google Map, return as object to store in state
function addPath({
  map,
  path,
  name,
  colour,
  editable,
  readOnly,
  onChange,
  onClick,
}) {
  let lineColour = colour ? colour : DEFAULT_LINE_COLOUR;
  let gMaps = window.google.maps;
  let gPath = new gMaps.Polyline({
    path: path,
    geodesic: true,
    strokeColor: lineColour,
    strokeOpacity: 1.0,
    strokeWeight: STROKE_WEIGHT,
    map: map,
    editable: !readOnly && editable,
  });
  if (!readOnly) {
    gPath.addListener("dragend", onChange);
    gPath.addListener("click", () => onClick(gPath));
    gMaps.event.addListener(gPath.getPath(), "insert_at", onChange);
    gMaps.event.addListener(gPath.getPath(), "remove_at", onChange);
    gMaps.event.addListener(gPath.getPath(), "set_at", onChange);
  }
  return { name: name, gPath: gPath, colour: lineColour };
}

// Add point to google map, return as object to store in state
function addPoint({ map, pt, draggable, onClick }) {
  let gPoint = new window.google.maps.Marker({
    position: pt.position,
    map: map,
    draggable: draggable,
    label: pt.label,
  });

  gPoint.addListener("click", () => {
    onClick(gPoint);
  });

  return { label: pt.label, gPoint: gPoint, description: pt.description };
}

// Gather editable data from map to export as json
function bundleMapData({ paths, points }) {
  //console.log(paths, points)
  const exportPaths = paths
    .map((pathObj) => {
      const positionList = pathObj.gPath.getPath().getArray();
      return {
        path: positionList.map((pos) => pos.toJSON()),
        name: pathObj.name,
        colour: pathObj.colour,
      };
    })
    .filter((pathObj) => pathObj.path.length > 1);

  const exportPoints = points.map((point) => {
    return {
      position: point.gPoint.getPosition().toJSON(),
      label: point.label,
      description: point.description,
    };
  });

  return { paths: exportPaths, points: exportPoints };
}

export {
  setMapToSearchInput,
  setLocationBias,
  setMapBounds,
  addPath,
  addPoint,
  bundleMapData,
};
