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
function setLocationBias(searchBox, map, position, geolocation){
    if(!(position||geolocation)){return}
    let pos = position ? position : {lat: parseFloat(geolocation.coords.latitude),lng: parseFloat(geolocation.coords.latitude)}
    
    let circle = new window.google.maps.Circle(
        {center: pos, radius:30}
    )
    if(searchBox){searchBox.setBounds(circle.getBounds())}
    if(map){map.setCenter(geolocation)}  
}


function addPath({map, path, name, colour, readOnly}){
    console.log(path)
    console.log(name)
    let lineColour = colour?colour:DEFAULT_LINE_COLOUR
    let gMaps = window.google.maps
    let gPath = new gMaps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: lineColour,
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map:this.map,
        editable:this.state.mode!=="locked" && !readOnly,
      });
    if(readOnly){
        console.log("READONLYPATH")
        let newPath = {name:name, gPath:gPath, colour:lineColour}
        this.state.readOnlyPaths.push(newPath)
    } else {
        gPath.addListener('dragend', this.returnPath);
        gPath.addListener('click', ()=>this.handlePathClick(gPath));
        gMaps.event.addListener(gPath.getPath(), "insert_at", this.returnPath);
        gMaps.event.addListener(gPath.getPath(), "remove_at", this.returnPath);
        gMaps.event.addListener(gPath.getPath(), "set_at", this.returnPath);
        let newPath = {name:name, gPath:gPath, colour:lineColour}
        this.state.paths.push(newPath)
        this.setState({activePath:this.state.paths.length-1})
        console.log("PROP PATH ADDED.")
    }
}



function changeMapMode(mode){
    let newMode=mode
    if(mode==="toggleLock"){
        if(this.state.mode==="locked"){
            //Unlock to default mode
            this.changeMapMode(this.props.initialMode)
            return
        }else{
            newMode="locked"
            this.lockAllPaths({})
            this.lockAllPoints()
        }
    }else if(mode==="newPath"){
        this.lockAllPaths({})
        this.lockAllPoints()
    }else if(mode==="editPoints"){
        //Unlock point dragging
        this.lockAllPoints(false)
    }

    this.setState({
        mode:newMode,
    })   
}

export {
    setMapToSearchInput,
    setLocationBias,
}