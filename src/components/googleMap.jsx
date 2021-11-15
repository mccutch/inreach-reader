import React from 'react';
import PropTypes from 'prop-types';
import {IconButton} from './reactComponents.jsx';
import {DEFAULT_MAP_CENTER, DEFAULT_LINE_COLOUR} from '../constants.js';
import {importGoogleLibraries} from '../helperFunctions.js';
import * as urls from '../urls.js';
import * as obj from '../objectDefinitions.js'

const markerLabels = "ABCDEFGHJKLMNPQRSTUVWXYZ"

class Info extends React.Component{
  render(){
    return(
      <p>
        FUCKFUCKFUCK
      </p>
    )
  }
}

class GoogleMapWrapper extends React.Component{
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
  constructor(props){
    super(props)
    this.state = {
      mode:(this.props.points&&this.props.points.length>0)||(this.props.paths&&this.props.paths.length>0)?"locked":this.props.initialMode,
      points:[],
      paths:[],
      readOnlyPoints:[],
      readOnlyPaths:[],
      labelIndex:0,
    }

    this.initGoogleMap=this.initGoogleMap.bind(this)  
    window.initGoogleMap=this.initGoogleMap  
    importGoogleLibraries("initGoogleMap")
    
    this.setLocationBias=this.setLocationBias.bind(this)
    this.parseGeolocation=this.parseGeolocation.bind(this)   
    this.setMapBounds=this.setMapBounds.bind(this)

    this.plotPaths=this.plotPaths.bind(this)
    this.plotPoints=this.plotPoints.bind(this)
    
    this.handleClick=this.handleClick.bind(this)
    this.useSearchInput=this.useSearchInput.bind(this)
    this.undo=this.undo.bind(this)
    this.changeMapMode=this.changeMapMode.bind(this)

    this.addToPath=this.addToPath.bind(this)

    this.addPoint=this.addPoint.bind(this)
    this.addPath=this.addPath.bind(this)

    this.handlePathClick=this.handlePathClick.bind(this)
    this.lockAllPaths=this.lockAllPaths.bind(this)
    this.lockAllPoints=this.lockAllPoints.bind(this)

    this.showPointInfo=this.showPointInfo.bind(this)

    this.returnPoints=this.returnPoints.bind(this)
    this.returnPath=this.returnPath.bind(this)

    this.editPathIdentifiers=this.editPathIdentifiers.bind(this)
    this.generatePointInfo=this.generatePointInfo.bind(this)

    // Return data to trip planner on remote trigger
    this.returnMapData=this.returnMapData.bind(this)
  }


  componentDidMount(){
    if(window.google){
      this.initGoogleMap()
    }
  }

  componentDidUpdate(prevProps){
    if(this.props.paths!==prevProps.paths && prevProps.paths.length>0){
      for(let i in this.props.paths){
        //console.log(this.props.paths[i])
        //console.log(prevProps.paths[i])
        if(prevProps.paths[i] && 
            (this.props.paths[i].name!==prevProps.paths[i].name || this.props.paths[i].colour!==prevProps.paths[i].colour)
          ){
          console.log("Something changed")
          this.editPathIdentifiers(i)
        }
      }
    }

    if(this.props.paths.length>(this.state.paths.length+this.state.readOnlyPaths.length)){
      console.log("NEW PATHS ADDED, PROBABLY INREACH DATA")
      for(let i=this.state.paths.length; i<this.props.paths.length; i++){
        this.addPath(this.props.paths[i])
      }
    }
    if(this.props.points.length>(this.state.points.length+this.state.readOnlyPoints.length)){
      console.log("NEW POINTS ADDED, PROBABLY INREACH DATA")
      for(let i=this.state.points.length; i<this.props.points.length; i++){
        this.addPoint(this.props.points[i])
      }
    }
  }

  editPathIdentifiers(i_loc){
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

  initGoogleMap() {
    console.log(`Initialising Google Maps.`)

    if(window.google){
      var gMaps = window.google.maps

      console.log("Initialising map...")
      let map = new gMaps.Map(document.getElementById(this.props.id), {
          zoom: 12,
          controlSize: 20,
          draggable: true,
          mapTypeControl: true,
          mapTypeId:"terrain",
        });
      this.map = map
      map.addListener("click", this.handleClick)
      
      if(this.props.searchBox){
        console.log("Initialising Autocomplete inputs.")
        let searchBox = new gMaps.places.Autocomplete(document.getElementById("search"))
        // Set the data fields to return when the user selects a place.
        searchBox.setFields(['address_components', 'geometry', 'icon', 'name', 'place_id'])
        // Take action when autocomplete suggestion is chosen, or raw text input is submitted
        searchBox.addListener('place_changed', this.useSearchInput)
        // Make components available to other functions in the class
        this.searchBox = searchBox


        if(this.props.locationBias){
          this.setLocationBias(this.props.locationBias.lat, this.props.locationBias.lng)
        } else {
          if(navigator.geolocation){
            console.log("Geolocation available")
            navigator.geolocation.getCurrentPosition(this.parseGeolocation)
          }
        }
      }

      
      let infoWindow = new gMaps.InfoWindow({
        content: "<p>Hello world</p>",
        map:this.map,
      });
      this.infoWindow = infoWindow
      
    } else {
      console.log("window.google not defined")
    }

    this.setMapBounds()
    this.plotPaths()
    this.plotPoints()
  }

  handleClick(event){
    if(this.temporaryMarker) this.temporaryMarker.setMap(null);
    if(!this.props.editable || this.state.mode==="locked") return;

    let mode=this.state.mode
    let latLng=event.latLng

    if(mode==="log"){
      console.log(latLng.toJSON());
    }else if(mode==="editPath"||mode==="newPath"){
      this.addToPath(latLng)
    }else if(mode==="editPoints"){
      //A,B,C,...Z,A1,B1,...Z1,A2,B2,...
      let label = `${markerLabels[this.state.labelIndex%markerLabels.length]}${this.state.labelIndex>=markerLabels.length?`${Math.floor(this.state.labelIndex/markerLabels.length)}`:""}`
      this.addPoint({position:latLng.toJSON(),label:label})
    }else{
      console.log("No valid mode")
    }
  }



  undo(){
    if(this.state.mode==="locked") return;

    if(this.state.mode==="editPoints"){
      if(this.state.points.length===0) return;
      let lastPoint = this.state.points[this.state.points.length-1]
      lastPoint.setMap(null)
      this.state.points.pop()
      this.setState({labelIndex:this.state.labelIndex-1}, this.returnPoints)
    }
    if(this.state.mode==="editPath"){
      if(this.state.paths.length===0) return;
      let gPath = this.state.paths[this.state.activePath].gPath
      //let gPath = this.state.activePath
      if(gPath.getPath().getLength()>0){
        gPath.getPath().pop()
      }
    }
  }

  returnPoints(){
    if(!this.props.returnPoints) return;
    let ptsList=[]
    for(let i in this.state.points){
      ptsList.push({position:this.state.points[i].getPosition().toJSON(), label:this.state.points[i].label, description:""})
    }
    this.props.returnPoints(ptsList)
  }

  useSearchInput(){
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

  setMapBounds(points){
    let boundaryPoints=[]
    if(points){
      console.log(points)
      boundaryPoints=points
    } else{
      if(this.props.points && this.props.points.length>0){
        console.log("Prop points found")
        for(let i in this.props.points){
          console.log(this.props.points[i])
          boundaryPoints.push(this.props.points[i].position);
        }
      }
      if(this.props.paths){
        for(let i in this.props.paths){
          let path = this.props.paths[i].path
          for(let j in path){
            boundaryPoints.push(path[j])
          }
        }
      } 
    }


    console.log(boundaryPoints)
    if(boundaryPoints.length<=1){
      console.log(boundaryPoints[0])
      this.map.setCenter(boundaryPoints[0] ? boundaryPoints[0]:(this.props.locationBias ? this.props.locationBias:DEFAULT_MAP_CENTER))
      return
    }

    var gMaps = window.google.maps
    let bounds = new gMaps.LatLngBounds()
    for(let i in boundaryPoints){
      bounds.extend(boundaryPoints[i])
    }
    this.map.fitBounds(bounds)
  }

  parseGeolocation(position){
    this.setLocationBias(position.coords.latitude, position.coords.longitude)
    console.log(`Position accuracy: ${position.coords.accuracy}`)
  }

  setLocationBias(lat, lng){
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

  plotPaths(){
    for(let i in this.props.paths){
      this.addPath(this.props.paths[i])
    }
  }

  addPath({path, name, colour, readOnly}){
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

  addToPath(latLng){
    console.log([latLng.toJSON()])
    if(this.state.mode==="newPath"/* || this.props.paths.length===0*/){
      console.log("new path")
      let newName = `Route ${this.state.paths.length+1}`
      this.addPath({path:[latLng],name:newName})
      this.setState({mode:"editPath"})
    }else{
      let gPath = this.state.paths[this.state.activePath].gPath //polyline object
      gPath.getPath().push(latLng)
    }
    this.returnPath()
  }

  handlePathClick(gPath){

    if(this.state.mode==="locked"){
      return
    }else{
      this.lockAllPaths({callback:()=>gPath.setEditable(true)})
      this.setState({mode:"editPath"})
      for(let i in this.state.paths){
        if(this.state.paths[i].gPath===gPath){
          this.setState({activePath:i})
          break;
        }
      }
    }
    
  }

  returnPath(){
    console.log("returnPath")
    let pathList = this.state.paths

    let allPaths = []
    for(let i in pathList){
      let gPath = pathList[i].gPath
      let array = gPath.getPath().getArray()

      let jsonList = []
      for(let j in array){
        jsonList.push(array[j].toJSON())
      }
      if(jsonList.length > 1){
        // Don't return a path with a single point
        allPaths.push({path:jsonList, name:pathList[i].name, colour:pathList[i].colour})
      }
      
    }
    this.props.returnPaths(allPaths)
  }

  plotPoints(){
    let clone = Object.assign({},this.props.points)
    console.log(clone)
    for(let i in clone){
      this.addPoint(clone[i])
    }
    console.log("PROP POINTS ADDED.")
  }

  addPoint(pt){
    let gMaps = window.google.maps
    console.log("not readonly", !pt.readOnly)
    console.log("not locked", !(this.state.mode==="locked"))
    
   
    let newPt = new gMaps.Marker({
      position:pt.position, 
      map:this.map, 
      draggable:this.state.mode!=="locked" && !pt.readOnly,
      label:pt.label,
    })

    newPt.addListener('click', ()=>this.showPointInfo(newPt, this.generatePointInfo(pt)))

    if(pt.readOnly){
      this.state.readOnlyPoints.push(newPt)
    }else{
      newPt.addListener('dragend', this.returnPoints); 
      this.state.points.push(newPt)
      this.setState({labelIndex:this.state.points.length},this.returnPoints)
    }
    
  }

  lockAllPaths({callback}){
    for(let i in this.state.paths){
      this.state.paths[i].gPath.setEditable(false)
    }
    if(callback) callback();
  }

  lockAllPoints(bool=true){
    for(let i in this.state.points){
      this.state.points[i].setDraggable(!bool)
    }
  }

  showPointInfo(gPoint, content){
    this.infoWindow.setContent(content)
    this.infoWindow.open({
      anchor:gPoint,
    })
  }

  generatePointInfo(pt){
    console.log(pt)
    return <Info />
  }

  changeMapMode(mode){
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

  returnMapData({onSuccess}){
    console.log("Remote trigger data pull from map.")
    this.returnPath()
    this.returnPoints()
    if(onSuccess){onSuccess()}
  }

  render(){
    let activeButton="btn-warning"
    let inactiveButton="btn-light"
    return(
      <div>
        {this.props.editable && 
          <div className="form-row p-2">
            <div className="col-md">
              <input type="search" id="search" placeholder="Search" className="form-control my-2"/>
            </div>
            <div className="col">
              <div className="row">
                {/*<div className="col">
                  <IconButton 
                    isActive={this.state.mode==="editPath"}
                    active={activeButton}
                    inactive={inactiveButton} 
                    onClick={()=>this.changeMapMode("editPath")} 
                    icon={urls.ROUTE_ICON}
                  />
                </div>*/}
                <div className="col">
                  <IconButton 
                    isActive={this.state.mode==="newPath"}
                    active={activeButton}
                    inactive={inactiveButton} 
                    onClick={()=>this.changeMapMode("newPath")} 
                    icon={urls.ADD_NEW_ICON}
                  />
                </div>
                <div className="col">
                  <IconButton 
                    isActive={this.state.mode==="editPoints"}
                    active={activeButton}
                    inactive={inactiveButton} 
                    onClick={()=>this.changeMapMode("editPoints")} 
                    icon={urls.WAYPOINT_ICON}
                  />
                </div>
                <div className="col">
                  <IconButton 
                    isActive={false}
                    active={activeButton}
                    inactive={inactiveButton} 
                    onClick={this.undo} 
                    icon={urls.UNDO_ICON}
                  />
                </div>
                <div className="col">
                  <IconButton 
                    isActive={this.state.mode==="locked"}
                    active={activeButton}
                    inactive={inactiveButton} 
                    onClick={()=>this.changeMapMode("toggleLock")} 
                    icon={urls.LOCK_ICON}
                  />
                </div>
              </div>
            </div>
          </div>
        }
        <div id={this.props.id} style={{height:"100vh"}}></div>
        {<p><strong>{this.state.errorMessage}</strong></p>}
      </div>
    )
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
  returnPoints: PropTypes.func,
  returnPaths: PropTypes.func,
}

export {
  GoogleMapWrapper
}
