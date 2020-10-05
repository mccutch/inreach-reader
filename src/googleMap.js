import React from 'react';
import {StandardModal} from './reactComponents.js';
import {DEFAULT_MAP_CENTER} from './constants.js';
import {importGoogleLibraries} from './helperFunctions.js';


export class GoogleMapWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = {
    }

    this.initGoogleMap=this.initGoogleMap.bind(this)  
    window.initGoogleMap=this.initGoogleMap  
    importGoogleLibraries("initGoogleMap")
    
    this.setLocationBias=this.setLocationBias.bind(this)
    this.parseGeolocation=this.parseGeolocation.bind(this)   
    this.setMapBounds=this.setMapBounds.bind(this)

    this.plotPaths=this.plotPaths.bind(this)
    this.plotPoints=this.plotPoints.bind(this)
  }

  componentDidMount(){
    if(window.google){
      this.initGoogleMap()
    }
  }

  initGoogleMap() {
    console.log(`Initialising Google Maps with mode=${this.props.mode}.`)

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
        if(this.props.locationBias){
          this.setLocationBias(this.props.locationBias.lat, this.props.locationBias.lng)
        } else {
          if(navigator.geolocation){
            console.log("Geolocation available")
            navigator.geolocation.getCurrentPosition(this.parseGeolocation)
          }
        }
      }
      
    } else {
      console.log("window.google not defined")
    }

    this.setMapBounds()
    this.plotPaths()
    this.plotPoints()
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

  render(){
    return(
      <div>
        <div id={this.props.id} style={{height:"300px", width:"100"}}></div>
        {<p><strong>{this.state.errorMessage}</strong></p>}
      </div>
    )
  }
}


export class GooglePathMap extends React.Component{
  constructor(props){
    super(props)

    this.state = {
    }

    this.initPathMap=this.initPathMap.bind(this)  
    window.initPathMap=this.initPathMap  
    importGoogleLibraries("initPathMap")
    this.setLocationBias=this.setLocationBias.bind(this)
    this.parseGeolocation=this.parseGeolocation.bind(this)
    this.plotPath=this.plotPath.bind(this)
    this.setMapBounds=this.setMapBounds.bind(this)
  }

  componentDidMount(){
    if(window.google){
      this.initPathMap()
    }
  }

  initPathMap() {
    console.log(`Initialising Google Maps with mode=${this.props.mode}.`)

    if(window.google){
      var gMaps = window.google.maps

      console.log("Initialising map...")
      let map = new gMaps.Map(document.getElementById(this.props.id), {
          center: this.props.points[0],
          zoom: 12,
          controlSize: 20,
          draggable: true,
          mapTypeControl: true,
          mapTypeId:"terrain",
        });
      this.map = map

      if(this.props.points){this.setMapBounds(this.props.points)}
      
      if(this.props.locationBias){
        this.setLocationBias(this.props.locationBias.lat, this.props.locationBias.lng)
      } else {
        if(navigator.geolocation){
          console.log("Geolocation available")
          navigator.geolocation.getCurrentPosition(this.parseGeolocation)
        }
      }
    } else {
      console.log("window.google not defined")
    }

    this.plotPath()
  }

  setMapBounds(points){
    if(points.length<=1){
      return
    }
    var gMaps = window.google.maps
    let bounds = new gMaps.LatLngBounds()
    for(let i in points){
      bounds.extend(points[i])
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
    //this.map.setCenter(geolocation)  
  }

  plotPath(){
    var gMaps = window.google.maps

    new gMaps.Polyline({
      path: this.props.points,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map:this.map,
      editable:this.props.editable,
    });
    //this.setMapBounds(this.props.points)
  }

  render(){
    return(
      <div>
        <div id={this.props.id} style={{height:"300px", width:"100"}}></div>
        {<p><strong>{this.state.errorMessage}</strong></p>}
      </div>
    )
  }
}


export class GooglePointMap extends React.Component{
  constructor(props){
    super(props)

    this.state = {
    }

    this.initPointMap=this.initPointMap.bind(this)  
    window.initPointMap=this.initPointMap  
    importGoogleLibraries("initPointMap")
    this.setLocationBias=this.setLocationBias.bind(this)
    this.parseGeolocation=this.parseGeolocation.bind(this)
    this.plotPoints=this.plotPoints.bind(this)
    this.setMapBounds=this.setMapBounds.bind(this)
  }

  componentDidMount(){
    if(window.google){
      this.initPointMap()
    }
  }

  initPointMap() {
    console.log(`Initialising Google Maps with mode=${this.props.mode}.`)

    if(window.google){
      var gMaps = window.google.maps

      console.log("Initialising map...")
      let map = new gMaps.Map(document.getElementById("map"), {
          center: this.props.points[0],
          zoom: 12,
          controlSize: 20,
          draggable: true,
          mapTypeControl: true,
          mapTypeId:"terrain",
        });
      this.map = map

      if(this.props.points){this.setMapBounds(this.props.points)}
      
      if(this.props.locationBias){
        this.setLocationBias(this.props.locationBias.lat, this.props.locationBias.lng)
      } else {
        if(navigator.geolocation){
          console.log("Geolocation available")
          navigator.geolocation.getCurrentPosition(this.parseGeolocation)
        }
      }
    } else {
      console.log("window.google not defined")
    }

    this.plotPoints()
  }

  setMapBounds(points){
    if(points.length<=1){
      return
    }
    var gMaps = window.google.maps
    let bounds = new gMaps.LatLngBounds()
    for(let i in points){
      bounds.extend(points[i])
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
    //this.map.setCenter(geolocation)  
  }

  plotPoints(){
    var gMaps = window.google.maps
    for(let i in this.props.points){
      new gMaps.Marker({position:this.props.points[i], map: this.map})
    }
    
  }

  render(){
    return(
      <div>
        <div id="map" style={{height:"300px", width:"100"}}></div>
        {<p><strong>{this.state.errorMessage}</strong></p>}
      </div>
    )
  }
}