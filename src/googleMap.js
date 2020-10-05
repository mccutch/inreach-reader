import React from 'react';
import {StandardModal} from './reactComponents.js';
import {DEFAULT_MAP_CENTER} from './constants.js';
import {importGoogleLibraries} from './helperFunctions.js';

export class GoogleMap extends React.Component{
  constructor(props){
    super(props)

    this.state = {
    }

    this.initMap=this.initMap.bind(this)  
    window.initMap=this.initMap  

    /*if(!window.google){
      console.log("Generating Google API script.")
      var script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places,geometry&callback=initMap`;
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
    }*/

    importGoogleLibraries("initMap")


    this.setLocationBias=this.setLocationBias.bind(this)
    this.parseGeolocation=this.parseGeolocation.bind(this)
  }

  componentDidMount(){
    if(window.google){
      this.initMap()
    }
  }

  initMap() {
    console.log(`Initialising Google Maps with mode=${this.props.mode}.`)

    if(window.google){
      var gMaps = window.google.maps

      console.log("Initialising map...")
      let map = new gMaps.Map(document.getElementById("map"), {
          center: {lat:this.props.lat, lng:this.props.lon},
          zoom: 8,
          controlSize: 20,
          draggable: true,
          mapTypeControl: true,
          mapTypeId:"terrain",
        });
      this.map = map

      
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
/*
  plotPoint(){
    let gMaps = window.google.maps

    if(this.state.origin && this.state.destination){
      console.log(`Finding flight path from ${this.state.origin.name} to ${this.state.destination.name}...`)
      if(this.state.via){console.log(`...via ${this.state.via.name}.`)}

      //Encode lat-long coordinates
      let flightPlanLocations = []
      let flightPlanCoords = []
      flightPlanLocations.push(this.state.origin.geometry.location)
      if(this.state.via){flightPlanLocations.push(this.state.via.geometry.location)}
      flightPlanLocations.push(this.state.destination.geometry.location)

      //Render polyline on map
      let bounds = new gMaps.LatLngBounds()
      for(let i in flightPlanLocations){
        bounds.extend(flightPlanLocations[i])
        flightPlanCoords.push(flightPlanLocations[i].toJSON())
      }
      this.map.fitBounds(bounds)
      this.polyLine.setPath(flightPlanCoords)
      this.polyLine.setMap(this.map);

      //Calculate flight distance
      let distance = gMaps.geometry.spherical.computeLength(flightPlanLocations)/1000
      this.setState({distance:distance}, this.updateDistance)
    }
  }*/


  render(){
    return(
      <div>
        <div id="map" style={{height:"300px", width:"100"}}></div>
        {<p><strong>{this.state.errorMessage}</strong></p>}
      </div>
    )
  }
}