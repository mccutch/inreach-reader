import React from 'react';
import {GoogleMapWrapper} from './googleMap.js'


export class TripPlanner extends React.Component{




  render(){


    return(
      <GoogleMapWrapper 
        id = {"baseMap"}
        paths={[
          [
            { lat: 37.772, lng: -122.214 },
            { lat: 21.291, lng: -157.821 },
            { lat: -18.142, lng: 178.431 },
            { lat: -27.467, lng: 153.027 },
          ],
        ]}
        editable={true}
      />

    )
  }
}