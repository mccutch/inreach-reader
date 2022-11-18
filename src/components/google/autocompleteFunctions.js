import { setLocationBias, convertGeoToPos } from './googleFunctions';

function initialiseAutocomplete({
  locationBias, 
  inputId, 
  useGeolocation,
  onPlaceChange,
}) {
  console.log(`Initialising Google Autocomplete field.`);
  if (!window.google) {
    console.log("window.google not defined");
    return null;
  }

  window.onPlaceChange = onPlaceChange;

  var gMaps = window.google.maps;
  console.log("Initialising Autocomplete inputs.");
  let autocomplete = new gMaps.places.Autocomplete(
    document.getElementById(inputId)
  );

  // Set the data fields to return when the user selects a place.
  autocomplete.setFields([
    "address_components",
    "geometry",
    "icon",
    "name",
    "place_id",
    "formatted_address",
  ]);

  // Take action when autocomplete suggestion is chosen, or raw text input is submitted
  autocomplete.addListener("place_changed", window.onPlaceChange);

  if (locationBias) {
    setLocationBias({ searchBox:autocomplete, position:locationBias })
  } else {
    if (navigator.geolocation) {
      const geo = navigator.geolocation.getCurrentPosition(useGeolocation);
      if(geo) setLocationBias({searchBox:autocomplete, position:convertGeoToPos(geo)});
    } else {
      console.error("Geolocation not supported by this browser.")
    }
  }

  return autocomplete
}


export {initialiseAutocomplete}