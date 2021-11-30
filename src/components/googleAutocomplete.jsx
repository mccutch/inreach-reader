import React from "react";
import { importGoogleLibraries } from "../helperFunctions.js";
import { convertGeoToPos, initialiseAutocomplete, setLocationBias } from "./googleMapFunctions.js";

export class GoogleAutocomplete extends React.Component {
  constructor(props) {
    super(props);

    this.initAutocomplete = this.initAutocomplete.bind(this);
    window.initAutocomplete = this.initAutocomplete;

    importGoogleLibraries("initAutocomplete");

    this.useLocation = this.useLocation.bind(this);
    window.useLocation = this.useLocation;
    this.useGeolocation = this.useGeolocation.bind(this);
  }

  componentDidMount() {
    if (window.google) {
      this.initAutocomplete()
    }
  }

  initAutocomplete(){
    this.autoObject = initialiseAutocomplete({locationBias:this.props.locationBias, inputId:this.props.id, useGeolocation:this.useGeolocation})
  }

  useGeolocation(geolocation) {
    const position = convertGeoToPos(geolocation)
    setLocationBias({searchBox:this.autoObject, position:position});
    //console.log(`Position accuracy: ${geolocation.coords.accuracy}`);
    if (this.props.returnLocation) this.props.returnLocation(position);
  }

  useLocation() {
    const place = this.autoObject.getPlace();
    if (place.geometry) {
      this.props.returnPlace(place);
    } else {
      this.setState({ errorMessage: `Unable to find ${place.name}.` });
      this.props.returnPlace(null)
    }
  }

  render() {
    return (
      <input
        type="text"
        id={this.props.id}
        name={this.props.name}
        placeholder={this.props.placeholder}
        className={this.props.className}
        defaultValue={this.props.defaultValue}
        maxLength={this.props.maxLength}
        onChange={(event) => {
          this.props.onChange(event);
          this.props.returnPlace(null);
        }}
      />
    );
  }
}
