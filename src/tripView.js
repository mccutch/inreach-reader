import React from 'react'
import {MessageList} from './messageDisplay.js'
import {TripList} from './tripDisplay.js'
import {GoogleMapWrapper} from './googleMap.js'
import {parseISODate, displayDate} from './dateFunctions.js'
import {Redirect} from "react-router-dom";
import * as urls from './urls.js'
import {apiFetch} from './helperFunctions.js'
import {StandardModal} from './reactComponents.js'



export class TripViewer extends React.Component{
  constructor(props){
    super(props)
    this.state = { 
    }
    this.handleError=this.handleError.bind(this)
  }

  componentDidMount(){
    let uuid = this.props.uuid
    console.log(uuid)

    apiFetch({
      url:`${urls.TRIP_READ_ONLY}/${this.props.uuid}/`,
      method:"GET",
      noAuth:true,
      onSuccess:(data)=>{
        console.log(data)

        let points = JSON.parse(data.trip.points)
        let paths = JSON.parse(data.trip.paths)

        this.setState({
          user:data.user, 
          trip:data.trip,
          //showOverdue: data.trip.overdue ? true : false,
          //showInstructions: data.trip.instructions ? true : false,
          showMap:(points.length>0||paths.length>0),
        })
      },
      onFailure:(error)=>{
        console.log(error)
        this.handleError("Unable to find trip.")
      },
    })
  }

  handleError(message){
    let title=<div>Error</div>
    let body=<p>{message}</p>
    this.props.app.setModal(<StandardModal title={title} body={body} hideModal={this.props.app.hideModal}/>)
    console.log("Redirect to home")
    this.setState({redirect:urls.HOME})
  }


  render(){
    if(this.state.redirect) return(<Redirect to={this.state.redirect}/>)

    if(!this.state.trip) return(<p>Loading...</p>)
   
    let trip = this.state.trip  
    let departs = parseISODate(trip.departs)
    let returnTime = parseISODate(trip.returns)
    let overdue = trip.overdue ? parseISODate(trip.overdue) : null
    let overdueInstructions = trip.instructions ? trip.instructions : null
    let paths = JSON.parse(trip.paths)
    let points = JSON.parse(trip.points)
    

    return(
      <div>
        <div>
          <h4>User: {this.state.user.username}</h4>
          <p>Email: {this.state.user.email}</p>
          <h4>{trip.name}</h4>
          <br/>
          <p>Departs: {displayDate(departs)}</p>
          <br/>
          <p>Returns: {displayDate(returnTime)}</p>
          <br/>
          <p>Overdue time: {trip.overdue && displayDate(overdue)}</p>
          <br/>
          <p>Instructions if overdue: {trip.instructions ? trip.instructions : "Not given."}</p>
          <br/>
          <p>Trip description: {trip.description}</p>
          <br/>
          {this.state.showMap &&
            <GoogleMapWrapper 
              id = {"readMap"}
              editable={false}
              points={points}
              paths={paths}
            />
          }
        </div>
      </div>
    )
    
  }
}