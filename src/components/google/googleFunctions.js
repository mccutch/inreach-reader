import { 
  DEFAULT_GMAP_BIAS_RADIUS,
  GOOGLE_API_KEY,
  GOOGLE_IMPORT_SCRIPT_ID,
} from '../../constants'

// Check if google libraries are already imported, or are being imported
function googleLibrariesAreImported(){
  return !!(window.google || document.getElementById(GOOGLE_IMPORT_SCRIPT_ID))
}

// Add script to index.html to import google libraries
function importGoogleLibraries({callbackFunctionName, callbackFunc}) {
  if (googleLibrariesAreImported()){
    console.log("Google libraries already imported.")
    callbackFunc()
    return
  }
  var script = document.createElement("script");
  script.id = GOOGLE_IMPORT_SCRIPT_ID;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places,geometry&callback=${callbackFunctionName}`;
  script.defer = true;
  script.async = true;
  console.warn("About to try")
  try{
    document.head.appendChild(script);
    console.warn("tried")
  } catch(err){
    console.warn("Welp", err)
  }
}

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
  importGoogleLibraries,
}