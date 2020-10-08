import React from 'react';
import {StandardModal} from './reactComponents.js';
import {DEFAULT_MAP_CENTER} from './constants.js';
import {importGoogleLibraries} from './helperFunctions.js';

const markerLabels = "ABCDEFGHJKLMNPQRSTUVWXYZ"

export class GoogleMapWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      mode:this.props.initialMode,
      locked:false,
      points:[],
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
    this.toggleMapLock=this.toggleMapLock.bind(this)

    this.addWaypoint=this.addWaypoint.bind(this)

    this.returnPoints=this.returnPoints.bind(this)
  }

  componentDidMount(){
    if(window.google){
      this.initGoogleMap()
    }
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

      if(this.props.points){this.setMapBounds(this.props.points)}
      
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
      //map.addListener("dragend", this.handleDragEnd)
      
    } else {
      console.log("window.google not defined")
    }

    this.setMapBounds()
    this.plotPaths()
    this.plotPoints()
  }

  handleClick(event){
    if(this.temporaryMarker) this.temporaryMarker.setMap(null);
    if(!this.props.editable || this.state.locked) return;

    let mode=this.state.mode
    let pt=event.latLng.toJSON()

    if(mode==="log"){
      console.log(pt);
    }else if(mode==="editPath"){
      this.addWaypoint(pt)
    }else if(mode==="editPoints"){
      this.addPoint(pt)
    }else{
      console.log("No valid mode")
    }
  }

  addWaypoint(pt){
    console.log(pt)
    console.log(pt)
  }

  addPoint(pt){
    let gMaps = window.google.maps
    //A,B,C,...Z,A1,B1,...Z1,A2,B2,...
    let label = `${markerLabels[this.state.labelIndex%markerLabels.length]}${this.state.labelIndex>=markerLabels.length?`${Math.floor(this.state.labelIndex/markerLabels.length)}`:""}`
    
    let newPt = new gMaps.Marker({
      position:pt, 
      map: this.map, 
      draggable:true,
      label:label,
    })

    newPt.addListener('dragend', this.returnPoints); 
    this.state.points.push(newPt)
    this.setState({labelIndex:this.state.labelIndex+1},this.returnPoints)
  }

  undo(){
    if(this.state.locked) return;

    if(this.state.mode==="editPoints"){
      if(this.state.points.length===0) return;
      let lastPoint = this.state.points[this.state.points.length-1]
      lastPoint.setMap(null)
      this.state.points.pop()
      this.setState({labelIndex:this.state.labelIndex-1}, this.returnPoints)
    }
  }

  returnPoints(){
    let ptsList=[]
    for(let i in this.state.points){
      ptsList.push({position:this.state.points[i].getPosition().toJSON(), label:this.state.points[i].label})
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
      boundaryPoints=points
    } else{
      if(this.props.points){
        for(let i in this.props.points){
          console.log(this.props.points[i])
          boundaryPoints.push(this.props.points[i]);
        }
      }
      if(this.props.paths){
        for(let i in this.props.paths){
          for(let j in this.props.paths[i]){
            boundaryPoints.push(this.props.paths[i][j])
          }
        }
      }  
    }

    console.log(boundaryPoints)
    if(boundaryPoints.length<=1){
      this.map.setCenter(boundaryPoints[0]?boundaryPoints[0]:DEFAULT_MAP_CENTER)
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
    var gMaps = window.google.maps

    for(let i in this.props.paths){
      new gMaps.Polyline({
        path: this.props.paths[i],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map:this.map,
        editable:this.props.editable,
      });
    }
  }

  plotPoints(){
    var gMaps = window.google.maps

    for(let i in this.props.points){
      new gMaps.Marker({position:this.props.points[i], map: this.map})
    }
  }

  toggleMapLock(){  
    this.setState({locked:!this.state.locked},
      ()=>{
        for(let i in this.state.points){
          this.state.points[i].setDraggable(!this.state.locked)
        }
      }
    )
  }

  render(){
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
                                  <button className={`btn btn-${(this.state.mode==="editPath"&&!this.state.locked)?"":"outline-"}teal btn-block`} onClick={()=>this.setState({mode:"editPath"})}>Route</button>
                                </div>*/}
                <div className="col">
                  <button className={`btn btn-${(this.state.mode==="editPoints"&&!this.state.locked)?"":"outline-"}teal btn-block`} onClick={()=>this.setState({mode:"editPoints"})}>Add Points</button>
                </div>
                <div className="col">
                  <button className={`btn btn-outline-teal btn-block`} onClick={this.undo}>Undo</button>
                </div>
                <div className="col">
                  <button className={`btn btn-${this.state.locked?"":"outline-"}teal btn-block`} onClick={this.toggleMapLock}>{this.state.locked?"Unlock":"Lock"}</button>
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

