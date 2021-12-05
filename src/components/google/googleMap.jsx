import React from "react";
import PropTypes from "prop-types";
import { MapControls } from "./googleMapControls";
import { AutocompleteInput } from "./AutocompleteInput";
import * as obj from "../../objectDefinitions";

import {
  initialiseGoogleMap,
  setMapToSearchInput,
  addPathToMap,
  addPointToMap,
  bundleMapData,
  getPointLabel,
  removeLastPointFromList,
  lockPaths,
  lockPoints,
  unlockPoints,
  getAllPoints,
  getInitialMapMode,
  selectPathToEdit,
} from "./googleMapFunctions";

import {
  importGoogleLibraries,
} from "./googleFunctions";

import {
  LOCKED,
  LOG,
  EDIT_PATH,
  NEW_PATH,
  EDIT_POINTS,
  TOGGLE_LOCK,
} from "./mapModeDefinitions";





// Render and control a google map
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
      mode: getInitialMapMode(this.props),
      points: [],
      paths: [],
      readOnlyPoints: [],
      readOnlyPaths: [],
      labelIndex: 0,
    };

    this.initGoogleMap = this.initGoogleMap.bind(this);

    this.handleClick = this.handleClick.bind(this);
    this.undo = this.undo.bind(this);
    this.changeMapMode = this.changeMapMode.bind(this);

    this.addToPath = this.addToPath.bind(this);
    this.addPoint = this.addPoint.bind(this);
    this.addPath = this.addPath.bind(this);
    this.lockAll = this.lockAll.bind(this);

    this.handlePathClick = this.handlePathClick.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this)

    // Return data to trip planner on remote trigger
    this.returnMapData = this.returnMapData.bind(this);
  }

  componentDidMount() {
    if (window.google) {
      this.initGoogleMap();
    } else {
      window.initGoogleMap = this.initGoogleMap;
      importGoogleLibraries("initGoogleMap");
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

  initGoogleMap() {
    this.map = initialiseGoogleMap({
      id: this.props.id,
      onClick: this.handleClick,
      locationBias: this.props.locationBias,
      boundaryPoints: getAllPoints({points:this.props.points, paths:this.props.paths}),
    })

    if (!this.map) {
      this.setState({ renderError: true })
      return
    }

    for (const point of this.props.points) this.addPoint(point);
    for (const path of this.props.paths) this.addPath(path);
  }

  handleClick(event) {
    if (this.temporaryMarker) this.temporaryMarker.setMap(null);
    if (!this.props.editable || this.state.mode === LOCKED) return;

    let mode = this.state.mode;
    let latLng = event.latLng;

    if (mode === LOG) {
      console.log(latLng.toJSON());
    } else if (mode === EDIT_PATH || mode === NEW_PATH) {
      this.addToPath(latLng);
    } else if (mode === EDIT_POINTS) {
      this.addPoint({
        position: latLng.toJSON(),
        label: getPointLabel(this.state.labelIndex),
        description: "",
      });
    } else {
      console.log("No valid mode");
    }
  }

  undo() {
    if (this.state.mode === LOCKED) return;

    if (this.state.mode === EDIT_POINTS) {
      if (this.state.points.length === 0) return;
      this.setState({ 
        labelIndex: this.state.labelIndex - 1,
        points: removeLastPointFromList(this.state.points)
      });
    }
    if (this.state.mode === EDIT_PATH) {
      if (this.state.paths.length === 0) return;
      let gPath = this.state.paths[this.state.activePath].gPath;
      if (gPath.getPath().getLength() > 0) {
        gPath.getPath().pop();
      }
    }
  }

  addPath({ path, name, colour, readOnly }) {
    let newPath = addPathToMap({
      map: this.map,
      path: path,
      name: name,
      colour: colour,
      editable: this.state.mode !== LOCKED && !readOnly,
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
    if (this.state.mode === NEW_PATH) {
      let newName = `Route ${this.state.paths.length + 1}`;
      this.addPath({ path: [latLng], name: newName });
      this.setState({ mode: EDIT_PATH });
    } else {
      let gPath = this.state.paths[this.state.activePath].gPath; //polyline object
      gPath.getPath().push(latLng);
    }
  }

  handlePathClick(gPath) {
    if (this.state.mode !== LOCKED) {
      this.setState({
        activePath: selectPathToEdit({
          pPath:gPath, 
          paths:this.state.paths
        }),
        mode: EDIT_PATH,
      })
    }
  }


  addPoint(pt) {
    let newPt = addPointToMap({
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

  lockAll(){
    lockPaths({paths:this.state.paths})
    lockPoints({points:this.state.paths})
  }

  changeMapMode(command) {
    let newMode = command;
    if (command === TOGGLE_LOCK) {
      if (this.state.mode === LOCKED) {
        //Unlock to default mode
        this.changeMapMode(this.props.initialMode);
        return;
      } else {
        newMode = LOCKED;
        this.lockAll()
      }
    } else if (command === NEW_PATH) {
      this.lockAll()
    } else if (command === EDIT_PATH) {
      unlockPoints({points:this.state.points})
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

  handleSearchInput(place){
    this.temporaryMarker = setMapToSearchInput({
      place:place, 
      map:this.map, 
      onNotFound:(searchTerm) => {
        this.setState({errorMessage: `Unable to find ${searchTerm}.`})
      }
    })
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
        <AutocompleteInput
            id = {"map-search-input"}
            placeholder = {"Search"}
            className = {"form-control my-2"}
            returnPlace = {this.handleSearchInput}
            returnLocation = {(location)=>console.log("Do nothing with location data:", location)}
            locationBias = {this.props.locationBias}
            returnErrorMessage = {(err)=>console.log("Autocomplete error:", err)}
        />
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
