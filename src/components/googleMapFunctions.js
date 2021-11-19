import {DEFAULT_MAP_CENTER, DEFAULT_LINE_COLOUR} from '../constants.js';

// Use search input to position the map and return a marker
function setMapToSearchInput({searchBox, map, onNotFound}){
    let place = searchBox.getPlace()
    console.log(place)
    if(!place.geometry){onNotFound(place.name); return null}
    map.setCenter(place.geometry.location)
    let temporaryMarker = new window.google.maps.Marker({
        position:place.geometry.location, map: map, title:place.name,
    })
    map.setZoom(13)
    return temporaryMarker
}

// Set map and autocomplete biasing based on user location
function setLocationBias({searchBox, map, position, geolocation}){
    if(!(position||geolocation)){return}
    let pos = position ? position : {lat: parseFloat(geolocation.coords.latitude),lng: parseFloat(geolocation.coords.latitude)}
    
    let circle = new window.google.maps.Circle(
        {center: pos, radius:30}
    )
    if(searchBox){searchBox.setBounds(circle.getBounds())}
    if(map){map.setCenter(geolocation)}  
}

// Set map bounds to include all points
function setMapBounds({map, points, locationBias}){
    if(points.length<=1){
        map.setCenter(points[0] ? points[0]:(locationBias ? locationBias:DEFAULT_MAP_CENTER))
        return
    }
    let bounds = new window.google.maps.LatLngBounds()
    for(let i in points){
        bounds.extend(points[i])
    }
    map.fitBounds(bounds)
}



export {
    setMapToSearchInput,
    setLocationBias,
    setMapBounds,
}