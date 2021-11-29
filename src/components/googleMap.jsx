import React from "react";
import PropTypes from "prop-types";
import { importGoogleLibraries } from "../helperFunctions.js";
import { MapControls, SEARCH_BAR_ID } from "./googleMapControls.jsx";
import * as obj from "../objectDefinitions.js";

import {
  setMapToSearchInput,
  setLocationBias,
  setMapBounds,
  addPath,
  addPoint,
  bundleMapData,
} from "./googleMapFunctions.js";

const markerLabels = "ABCDEFGHJKLMNPQRSTUVWXYZ";

class Info extends React.Component {
  render() {
    return <p>FUCKFUCKFUCK</p>;
  }
}

class GoogleMapWrapper extends React.Component {
  /*
  Accept editable and read-only points to display on the map.

  Editable points:
   - Position
   - Label
   - Description

  Read-only points:
  - Position
  - Label
  - Description
  - readOnly=true

  Return points/paths:
  - When points/paths are edited, return object containing all point/path data

  */
  constructor(props) {
    super(props);
    this.state = {
      mode:
        (this.props.points && this.props.points.length > 0) ||
        (this.props.paths && this.props.paths.length > 0)
          ? "locked"
          : this.props.initialMode,
      points: [],
      paths: [],
      readOnlyPoints: [],
      readOnlyPaths: [],
      labelIndex: 0,
    };

    this.initGoogleMap = this.initGoogleMap.bind(this);
    window.initGoogleMap = this.initGoogleMap;
    importGoogleLibraries("initGoogleMap");

    this.parseGeolocation = this.parseGeolocation.bind(this);
    this.findMapBounds = this.findMapBounds.bind(this);
    this.plotPaths = this.plotPaths.bind(this);
    this.plotPoints = this.plotPoints.bind(this);

    this.handleClick = this.handleClick.bind(this);
    this.undo = this.undo.bind(this);
    this.changeMapMode = this.changeMapMode.bind(this);

    this.addToPath = this.addToPath.bind(this);

    this.addPoint = this.addPoint.bind(this);
    this.addPath = this.addPath.bind(this);

    this.handlePathClick = this.handlePathClick.bind(this);
    this.lockAllPaths = this.lockAllPaths.bind(this);
    this.lockAllPoints = this.lockAllPoints.bind(this);

    this.showPointInfo = this.showPointInfo.bind(this);

    this.editPathIdentifiers = this.editPathIdentifiers.bind(this);
    this.generatePointInfo = this.generatePointInfo.bind(this);

    // Return data to trip planner on remote trigger
    this.returnMapData = this.returnMapData.bind(this);
  }

  componentDidMount() {
    if (window.google) {
      this.initGoogleMap();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.paths.length > prevProps.paths.length) {
      console.log("NEW PATHS ADDED, PROBABLY INREACH DATA");
      for (let i = this.state.paths.length; i < this.props.paths.length; i++) {
        this.addPath(this.props.paths[i]);
      }
    }
    if (this.props.points.length > prevProps.points.length) {
      console.log("NEW POINTS ADDED, PROBABLY INREACH DATA");
      for (
        let i = this.state.points.length;
        i < this.props.points.length;
        i++
      ) {
        this.addPoint(this.props.points[i]);
      }
    }
  }

  editPathIdentifiers(i_loc) {
    let updatedPaths = [];
    for (let i in this.state.paths) {
      if (i === i_loc) {
        console.log("i=iloc");
        this.state.paths[i].gPath.setOptions({
          strokeColor: this.props.paths[i].colour,
        });
        let updatedPath = {
          name: this.props.paths[i].name,
          colour: this.props.paths[i].colour,
          gPath: this.state.paths[i].gPath,
        };
        updatedPaths.push(updatedPath);
      } else {
        updatedPaths.push(this.state.paths[i]);
      }
    }
    this.setState({ paths: updatedPaths }, () => console.log(this.state.paths));
  }

  initGoogleMap() {
    console.log(`Initialising Google Maps.`);
    console.log(this.props.id);
    try {
      if (window.google) {
        var gMaps = window.google.maps;

        console.log("Initialising map...");
        let map = new gMaps.Map(document.getElementById(this.props.id), {
          zoom: 12,
          controlSize: 20,
          draggable: true,
          mapTypeControl: true,
          mapTypeId: "terrain",
        });
        this.map = map;
        map.addListener("click", this.handleClick);

        if (this.props.searchBox) {
          console.log("Initialising Autocomplete inputs.");
          let searchBox = new gMaps.places.Autocomplete(
            document.getElementById(SEARCH_BAR_ID)
          );
          // Set the data fields to return when the user selects a place.
          searchBox.setFields([
            "address_components",
            "geometry",
            "icon",
            "name",
            "place_id",
          ]);
          // Take action when autocomplete suggestion is chosen, or raw text input is submitted
          searchBox.addListener("place_changed", () => {
            this.temporaryMarker = setMapToSearchInput({
              searchBox: searchBox,
              map: this.map,
              onNotFound: (searchTerm) => {
                this.setState({
                  errorMessage: `Unable to find ${searchTerm}.`,
                });
              },
            });
          });
          // Make components available to other functions in the class
          this.searchBox = searchBox;

          if (this.props.locationBias) {
            setLocationBias({
              searchBox: this.searchBox,
              position: this.props.locationBias,
            });
          } else {
            if (navigator.geolocation) {
              console.log("Geolocation available");
              navigator.geolocation.getCurrentPosition(this.parseGeolocation);
            }
          }
        }

        let infoWindow = new gMaps.InfoWindow({
          content: "<p>Hello world</p>",
          map: this.map,
        });
        this.infoWindow = infoWindow;
      } else {
        console.log("window.google not defined");
      }

      this.findMapBounds();
      this.plotPaths();
      this.plotPoints();
    } catch (err) {
      console.log("initGoogleMaps error:", err);
      this.setState({ renderError: true });
    }
  }

  handleClick(event) {
    if (this.temporaryMarker) this.temporaryMarker.setMap(null);
    if (!this.props.editable || this.state.mode === "locked") return;

    let mode = this.state.mode;
    let latLng = event.latLng;

    if (mode === "log") {
      console.log(latLng.toJSON());
    } else if (mode === "editPath" || mode === "newPath") {
      this.addToPath(latLng);
    } else if (mode === "editPoints") {
      //A,B,C,...Z,A1,B1,...Z1,A2,B2,...
      let label = `${
        markerLabels[this.state.labelIndex % markerLabels.length]
      }${
        this.state.labelIndex >= markerLabels.length
          ? `${Math.floor(this.state.labelIndex / markerLabels.length)}`
          : ""
      }`;
      this.addPoint({
        position: latLng.toJSON(),
        label: label,
        description: "",
      });
    } else {
      console.log("No valid mode");
    }
  }

  undo() {
    if (this.state.mode === "locked") return;

    if (this.state.mode === "editPoints") {
      if (this.state.points.length === 0) return;
      let lastPoint = this.state.points[this.state.points.length - 1];
      lastPoint.gPoint.setMap(null);
      this.state.points.pop();
      this.setState({ labelIndex: this.state.labelIndex - 1 });
    }
    if (this.state.mode === "editPath") {
      if (this.state.paths.length === 0) return;
      let gPath = this.state.paths[this.state.activePath].gPath;
      if (gPath.getPath().getLength() > 0) {
        gPath.getPath().pop();
      }
    }
  }

  findMapBounds() {
    let boundaryPoints = [];
    if (this.props.points && this.props.points.length > 0) {
      for (const point of this.props.points) {
        boundaryPoints.push(point.position);
      }
    }
    if (this.props.paths) {
      for (const pathObj of this.props.paths) {
        for (const position of pathObj.path) {
          boundaryPoints.push(position);
        }
      }
    }
    setMapBounds({
      map: this.map,
      points: boundaryPoints,
      locationBias: this.props.locationBias,
    });
  }

  parseGeolocation(geolocation) {
    setLocationBias({ searchBox: this.searchBox, geolocation: geolocation });
    console.log(`Position accuracy: ${geolocation.coords.accuracy}`);
  }

  plotPaths() {
    for (const path of this.props.paths) {
      this.addPath(path);
    }
  }

  addPath({ path, name, colour, readOnly }) {
    let newPath = addPath({
      map: this.map,
      path: path,
      name: name,
      colour: colour,
      editable: this.state.mode !== "locked" && !readOnly,
      readOnly: readOnly,
      onChange: () => {},
      onClick: this.handlePathClick,
    });
    // Add new path to state
    if (readOnly) {
      this.setState({ readOnlyPaths: [...this.state.readOnlyPaths, newPath] });
    } else {
      this.setState({ paths: [...this.state.paths, newPath] });
      this.setState({ activePath: this.state.paths.length - 1 });
    }
  }

  addToPath(latLng) {
    //console.log([latLng.toJSON()])
    if (this.state.mode === "newPath") {
      console.log("new path");
      let newName = `Route ${this.state.paths.length + 1}`;
      this.addPath({ path: [latLng], name: newName });
      this.setState({ mode: "editPath" });
    } else {
      let gPath = this.state.paths[this.state.activePath].gPath; //polyline object
      gPath.getPath().push(latLng);
    }
  }

  handlePathClick(gPath) {
    if (this.state.mode === "locked") {
      return;
    } else {
      this.lockAllPaths({ callback: () => gPath.setEditable(true) });
      this.setState({ mode: "editPath" });
      for (let i in this.state.paths) {
        if (this.state.paths[i].gPath === gPath) {
          this.setState({ activePath: i });
          break;
        }
      }
    }
  }

  plotPoints() {
    let clone = Object.assign([], this.props.points);
    console.log(clone);
    for (const point of clone) {
      this.addPoint(point);
    }
  }

  addPoint(pt) {
    let newPt = addPoint({
      map: this.map,
      pt: pt,
      draggable: this.state.mode !== "locked" && !pt.readOnly,
      onClick: (point) => {
        console.log(point);
      },
    });

    if (pt.readOnly) {
      this.setState({ readOnlyPoints: [...this.state.readOnlyPoints, newPt] });
    } else {
      this.setState({
        points: [...this.state.points, newPt],
        labelIndex: this.state.labelIndex + 1,
      });
    }
  }

  lockAllPaths({ callback }) {
    for (const path of this.state.paths) {
      path.gPath.setEditable(false);
    }
    if (callback) callback();
  }

  lockAllPoints(bool = true) {
    for (const point of this.state.points) {
      point.gPoint.setDraggable(!bool);
    }
  }

  showPointInfo(gPoint, content) {
    this.infoWindow.setContent(content);
    this.infoWindow.open({
      anchor: gPoint,
    });
  }

  generatePointInfo(pt) {
    console.log(pt);
    return <Info />;
  }

  changeMapMode(mode) {
    let newMode = mode;
    if (mode === "toggleLock") {
      if (this.state.mode === "locked") {
        //Unlock to default mode
        this.changeMapMode(this.props.initialMode);
        return;
      } else {
        newMode = "locked";
        this.lockAllPaths({});
        this.lockAllPoints();
      }
    } else if (mode === "newPath") {
      this.lockAllPaths({});
      this.lockAllPoints();
    } else if (mode === "editPoints") {
      //Unlock point dragging
      this.lockAllPoints(false);
    }

    this.setState({
      mode: newMode,
    });
  }

  // Pull data from parent component. Returns !readOnly data to save.
  returnMapData() {
    console.log("Remote trigger data pull from map.");
    console.log(this.state.paths, this.state.points);
    return bundleMapData({
      paths: this.state.paths,
      points: this.state.points,
    });
  }

  render() {
    console.log("RENDER", this.props.id);
    if (this.state.renderError) {
      return (
        <div>
          <p>Sorry, unable to render map.</p>
        </div>
      );
    }
    return (
      <div>
        {this.props.editable && (
          <MapControls
            mode={this.state.mode}
            changeMode={this.changeMapMode}
            undo={this.undo}
          />
        )}
        <div id={this.props.id} style={{ height: "80vh" }}></div>
        {
          <p>
            <strong>{this.state.errorMessage}</strong>
          </p>
        }
      </div>
    );
  }
}
GoogleMapWrapper.propTypes = {
  id: PropTypes.string,
  editable: PropTypes.bool,
  locationBias: PropTypes.shape(obj.Position),
  points: PropTypes.arrayOf(obj.Point),
  paths: PropTypes.arrayOf(obj.Path),
  initialMode: PropTypes.string,
  searchBox: PropTypes.bool,
};

export { GoogleMapWrapper };
