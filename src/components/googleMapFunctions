import {DEFAULT_MAP_CENTER, DEFAULT_LINE_COLOUR} from '../constants.js';

function editPathIdentifiers(i_loc){
    let updatedPaths=[]
    for(let i in this.state.paths){
        if(i===i_loc){
            console.log("i=iloc")
            this.state.paths[i].gPath.setOptions({strokeColor:this.props.paths[i].colour})
            let updatedPath = {name:this.props.paths[i].name, colour:this.props.paths[i].colour, gPath:this.state.paths[i].gPath}
            updatedPaths.push(updatedPath)
        }else{
            updatedPaths.push(this.state.paths[i])
        }
    }
    this.setState({paths:updatedPaths},()=>console.log(this.state.paths))
}

function useSearchInput(){
    let place = this.searchBox.getPlace()
    console.log(place)
    if(!place.geometry){this.setState({errorMessage:`Unable to find ${place.name}.`}); return}
    this.map.setCenter(place.geometry.location)
    // Create location bias from user location if no points exist
    let temporaryMarker = new window.google.maps.Marker({
        position:place.geometry.location, map: this.map, title:place.name,
    })
    this.map.setZoom(13)
    this.temporaryMarker = temporaryMarker
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

function setLocationBias(searchBox, lat, lng){
    // Set map center and autocomplete biasing based on user location
    var gMaps = window.google.maps

    let geolocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
    }
    console.log(geolocation)
    let circle = new gMaps.Circle(
        {center: geolocation, radius:30}
    )
    this.searchBox.setBounds(circle.getBounds())
    //this.map.setCenter(geolocation)  
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
    editPathIdentifiers,
    addPath,
    setLocationBias,
    useSearchInput,
    changeMapMode,
}