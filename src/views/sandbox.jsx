import React from 'react'
import {apiFetch} from '../helperFunctions.js'

export class SandBox extends React.Component{



  render(){

    return(
      <div>
        <p>blah</p>
        <input type="text" className="form-control" placeholder="Garmin username" onChange={(e)=>this.setState({username:e.target.value})} />
        <button className="btn btn-success" onClick={()=>{

 

          apiFetch({
            url:`https://inreach.garmin.com/feed/share/${this.state.username}`,
            method:'GET',
            noAuth: true,
            contentType:'text/plain',
            onSuccess:(kml)=>{
              console.log(kml)
            },
            onFailure:(err)=>{
              console.log(err)
            }
          })    
        }} >Get KML</button>
      </div>
    )
  }
}