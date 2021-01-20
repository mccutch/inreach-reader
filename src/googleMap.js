import React from 'react';
import {ObjectSelectionList} from './reactComponents.js';
import {DEFAULT_MAP_CENTER, DEFAULT_LINE_COLOUR} from './constants.js';
import {importGoogleLibraries, getObject} from './helperFunctions.js';

const markerLabels = "ABCDEFGHJKLMNPQRSTUVWXYZ"

export class GoogleMapWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      mode:(this.props.points&&this.props.points.length>0)||(this.props.paths&&this.props.paths.length>0)?"locked":this.props.initialMode,
      points:[],
      paths:[],
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

    this.returnPoints=this.returnPoints.bind(this)
    this.returnPath=this.returnPath.bind(this)

    this.editPathIdentifiers=this.editPathIdentifiers.bind(this)
  }

  componentDidMount(){
    if(window.google){
      this.initGoogleMap()
    }
  }

  componentDidUpdate(prevProps){
    if(this.props.paths!==prevProps.paths && prevProps.paths.length>0){
      for(let i in this.props.paths){
        console.log(this.props.paths[i])
        console.log(prevProps.paths[i])
        if(prevProps.paths[i] && 
            (this.props.paths[i].name!==prevProps.paths[i].name || this.props.paths[i].colour!==prevProps.paths[i].colour)
          ){
          console.log("Something changed")
          this.editPathIdentifiers(i)
        }
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

      //if(this.props.points){this.setMapBounds(this.props.points)}
      
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

      map.addListener("click", this.handleClick)
      
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

  addPath({path, name, colour}){
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
        editable:this.state.mode!=="locked",
      });
    gPath.addListener('dragend', this.returnPath);
    gMaps.event.addListener(gPath.getPath(), "insert_at", this.returnPath);
    gMaps.event.addListener(gPath.getPath(), "remove_at", this.returnPath);
    gMaps.event.addListener(gPath.getPath(), "set_at", this.returnPath);
    let newPath = {name:name, gPath:gPath, colour:lineColour}
    this.state.paths.push(newPath)
    this.setState({activePath:this.state.paths.length-1})
    console.log("PROP PATH ADDED.")
  }

  plotPoints(){
    let clone = Object.assign({},this.props.points)
    console.log(clone)
    for(let i in clone){
      this.addPoint(clone[i])
    }
    console.log("PROP POINTS ADDED.")
  }

  addToPath(latLng){
    console.log([latLng.toJSON()])
    if(this.state.mode==="newPath" || this.props.paths.length===0){
      console.log("new path")
      let newName = `Route ${this.state.paths.length+1}`
      this.addPath({path:[latLng],name:newName})
      this.setState({mode:"editPath"})
    }else{
      let gPath = this.state.paths[this.state.activePath].gPath //polyline object
      //let gPath=this.state.activePath
      let path = gPath.getPath().push(latLng)
    }
    this.returnPath()
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
      allPaths.push({path:jsonList, name:pathList[i].name, colour:pathList[i].colour})
    }
    this.props.returnPaths(allPaths)
  }

  addPoint(pt){
    let gMaps = window.google.maps
    console.log(pt)
   
    let newPt = new gMaps.Marker({
      position:pt.position, 
      map:this.map, 
      draggable:!this.state.mode==="locked",
      label:pt.label,
    })

    newPt.addListener('dragend', this.returnPoints); 
    this.state.points.push(newPt)
    this.setState({labelIndex:this.state.points.length},this.returnPoints)
  }

  changeMapMode(mode){
    let newMode=mode
    if(mode==="toggleLock"){
      if(this.state.mode==="locked"){
        this.changeMapMode(this.props.initialMode)
        return
      }else{
        newMode="locked"
      }
    }

    let newActivePath = null
    if(mode==="editPath"){
      if(this.state.mode==="editPath"){
        //Toggle activePath
        if(this.state.activePath===this.state.paths.length-1){
          newActivePath=0
        }else{
          newActivePath=this.state.activePath+1
        }
      }else{
        newActivePath=this.state.paths.length-1
      }
    }

    //setEditable for all points
    for(let i in this.state.points){
      this.state.points[i].setDraggable(mode==="editPoints"?true:false)
    }
    
    // Lock all non-active paths
    for(let i in this.state.paths){
      this.state.paths[i].gPath.setEditable(newActivePath==i?true:false)
    }

    this.setState({
      activePath:newActivePath,
      mode:newMode,
    })
      
  }

  render(){
    let btnColour = "warning"
    return(
      <div>
        {this.props.editable && 
          <div className="form-row p-2">
            <div className="col-md">
              <input type="search" id="search" placeholder="Search" className="form-control my-2"/>
            </div>
            <div className="col">
              <div className="row">
                <div className="col">
                  <button className={`btn btn-${this.state.mode==="editPath"?"":"outline-"}${btnColour} btn-block`} onClick={()=>this.changeMapMode("editPath")}>R</button>
                </div>
                <div className="col">
                  <button className={`btn btn-${this.state.mode==="newPath"?"":"outline-"}${btnColour} btn-block`} onClick={()=>this.changeMapMode("newPath")}>+R</button>
                </div>
                <div className="col">
                  <button className={`btn btn-${this.state.mode==="editPoints"?"":"outline-"}${btnColour} btn-block`} onClick={()=>this.changeMapMode("editPoints")}>Points</button>
                </div>
                <div className="col">
                  <button className={`btn btn-outline-${btnColour} btn-block`} onClick={this.undo}>Undo</button>
                </div>
                <div className="col">
                  <button className={`btn btn-${this.state.mode==="locked"?"":"outline-"}${btnColour} btn-block`} onClick={()=>this.changeMapMode("toggleLock")}>{this.state.mode==="locked"?"Unlock":"Lock"}</button>
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

