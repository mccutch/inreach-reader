import {
  DEFAULT_MAP_CENTER,
  DEFAULT_LINE_COLOUR,
  STROKE_WEIGHT,
  DEFAULT_GMAP_ZOOM,
} from "../../constants";

import * as modes from './mapModeDefinitions' 


// Initialise and return a google map object
function initialiseGoogleMap({
  id,
  onClick,
  locationBias,
  boundaryPoints,
}) {
  console.log(`Initialising Google Maps.`);
  console.log(id);
  try {
    if (!window.google) {
      console.log("window.google not defined")
      return null
    }
      const gMaps = window.google.maps;

      console.log("Initialising map...");
      const map = new gMaps.Map(document.getElementById(id), {
        zoom: 12,
        controlSize: 20,
        draggable: true,
        mapTypeControl: true,
        mapTypeId: "terrain",
      });
      map.addListener("click", onClick);

    setMapBounds({
      map: map,
      points: boundaryPoints,
      locationBias: locationBias,
    });

    return map

  } catch (err) {
    console.error("Exception during map initialisation: ", err)
    return null
  }
}

// Use search input to position the map and return a marker
function setMapToSearchInput({ place, map, onNotFound }) {
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

//
function getAllPoints({points, paths}){
  let boundaryPoints = [];
  if (points) {
    for (const point of this.props.points) {
      boundaryPoints.push(point.position);
    }
  }
  if (paths) {
    for (const pathObj of this.props.paths) {
      for (const position of pathObj.path) {
        boundaryPoints.push(position);
      }
    }
  }
  return boundaryPoints
}

// Add path to Google Map, return as object to store in state
function addPathToMap({
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
function addPointToMap({ map, pt, draggable, onClick }) {
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

//Return a label in form of A,B,C,...Z,A1,B1,...Z1,A2,B2,...
function getPointLabel(index){
  const markerLabels = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const letter = markerLabels[index % markerLabels.length]
  const number = index >= markerLabels.length
    ? `${Math.floor(index / markerLabels.length)}`
    : ""
  return `${letter}${number}`
}

// Delete last point from map, return updated list
function removeLastPointFromList(pointList){
  if (pointList.length === 0) return [];
  let points = pointList
  const lastPoint = points.pop();
  lastPoint.gPoint.setMap(null);
  return points
}

// 
function lockPoints({points, callback}){
  for (const point of points) {
    point.gPoint.setDraggable(false);
  }
  if (callback) callback();
}

function lockPaths({paths, callback}){
  for (const path of paths) {
    path.gPath.setEditable(false);
  }
  if (callback) callback();
}

function unlockPoints({points, callback}){
  for (const point of points) {
    point.gPoint.setDraggable(true);
  }
  if (callback) callback();
}

function unlockPath({path, callback}){
  path.gPath.setEditable(true);
  if (callback) callback();
}

function selectPathToEdit({gPath, pathList}){
  lockPaths({ 
    paths:pathList, 
    callback: () => gPath.setEditable(true) 
  });

  for (let i in this.state.paths) {
    if (this.state.paths[i].gPath === gPath) {
      const activePathIndex = i
      return activePathIndex;
    }
  }
  return null;
}

function hasPaths(dataObject){
  return !!(dataObject.paths && dataObject.paths.length !== 0)
}

function hasPoints(dataObject){
  return !!(dataObject.points && dataObject.points.length !== 0)
}

// Intitialise map as locked if it already has data
function getInitialMapMode(mapProps){
  (hasPaths(mapProps) || hasPoints(mapProps))
    ? modes.LOCKED
    : this.props.initialMode
}


export {
  initialiseGoogleMap,
  setMapToSearchInput,
  setMapBounds,
  addPathToMap,
  addPointToMap,
  bundleMapData,
  getPointLabel,
  removeLastPointFromList,
  lockPoints,
  lockPaths,
  unlockPath,
  unlockPoints,
  selectPathToEdit,
  getAllPoints,
  hasPaths,
  hasPoints,
  getInitialMapMode,
};
