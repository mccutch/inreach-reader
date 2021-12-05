import React, { useEffect, useState } from "react";
import { initialiseAutocomplete } from "./autocompleteFunctions.js";
import { convertGeoToPos, setLocationBias, importGoogleLibraries } from "./googleFunctions.js";


// Render an AutoComplete input component
export function AutocompleteInput({
  id,
  name,
  placeholder,
  className,
  defaultValue,
  maxLength,
  onChange,
  returnPlace,
  returnLocation,
  locationBias,
  returnErrorMessage,
}){

  const [autocompleteInstance, setAutocompleteInstance] = useState(null)

  // Run at creation
  useEffect(()=>{
    if (window.google) {
      initAutocomplete()
    } else {
      // import google libraries with callback to initialise
      window.initAutocomplete = initAutocomplete;
      importGoogleLibraries("initAutocomplete");
    }
  },[])

  function initAutocomplete(){
    setAutocompleteInstance(
      initialiseAutocomplete({
        locationBias:locationBias, 
        inputId:id, 
        useGeolocation:biasWithGeolocation,
        onPlaceChange:useLocation,
      })
    )
  }

  function biasWithGeolocation(geolocation) {
    const position = convertGeoToPos(geolocation)
    setLocationBias({searchBox:autocompleteInstance, position:position});
    //console.log(`Position accuracy: ${geolocation.coords.accuracy}`);
    if (returnLocation) returnLocation(position);
  }

  function useLocation() {
    const place = autocompleteInstance.getPlace();
    if (place.geometry) {
      returnPlace(place);
    } else {
      returnErrorMessage(`Unable to find ${place.name}.`);
      returnPlace(null)
    }
  }

  return (
    <input
      type="text"
      id={id}
      placeholder={placeholder}
      className={className}
      defaultValue={defaultValue}
      maxLength={maxLength}
      onChange={(event) => {
        if (onChange) onChange(event);
      }}
    />
  ); 
}
