import React from 'react'
import {MessageList} from './messageDisplay.js'
import {TripList} from './tripDisplay.js'
import {GoogleMapWrapper} from './googleMap.js'
import {parseISODate, displayDate} from './dateFunctions.js'
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import * as urls from './urls.js'
import {apiFetch} from './helperFunctions.js'

export class UserViewer extends React.Component{
  constructor(props){
    super(props)
    this.state={
      userParam:this.props.match.params.username,
    }
  }

  componentDidMount(){
    this.fetchUserData()
  }

  componentDidUpdate(prevProps){
    if(this.props.match.params.username !== prevProps.match.params.username){
      this.setState({
        userParam:this.props.match.params.username,
      },this.fetchUserData)
      
    }
  }

  fetchUserData(){
    if(!this.state.userParam){
      console.log("No user param")
      return;
    }
    this.setState({notFound:false})
    apiFetch({
      url:`${urls.VIEW_USER}/${this.state.userParam}/`,
      method:'GET',
      noAuth:true,
      onSuccess:(json)=>{
        this.setState({
          user:json.user[0],
          trips:json.trips,
          messages:json.messages,
        })
      },
      onFailure:(err)=>{
        console.log(err)
        console.log("Send back to search")
      },
    })
  }

  render(){
    return(
      <Router>
        <Switch>
          <Route path={`${urls.VIEWER}/:username/:tripId`}>
            <TripViewer trip={this.state.viewTrip}/>
          </Route>
          <Route path="*">
            {this.state.user&&
              <div>
                <TripList 
                  viewOnly={true}
                  trips={this.state.trips}
                  app={this.props.app}
                  username={this.state.user.username}
                  onClick={(trip)=>{
                    this.setState({viewTrip:trip})
                  }}
                />
                <MessageList 
                  messages={this.state.messages}
                  app={this.props.app}
                />
              </div>
            }
            
            
          </Route>
        </Switch>
      </Router>
    )
  }
}


export class TripViewer extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      showOverdue: this.props.trip.overdue ? true : false,
      showMap:false,
      showInstructions: this.props.trip.instructions ? true : false,
    }
    
  }

  componentDidMount(){
    let points = JSON.parse(this.props.trip.points)
    let paths = JSON.parse(this.props.trip.paths)
    this.setState({showMap:(points.length>0||paths.length>0)})
  }


  render(){
    let trip = this.props.trip  
    let departs = parseISODate(trip.departs)
    let returnTime = parseISODate(trip.returns)
    let overdue = trip.overdue ? parseISODate(trip.overdue) : null
    let overdueInstructions = trip.instructions ? trip.instructions : null
    let paths = JSON.parse(trip.paths)
    let points = JSON.parse(trip.points)
    

    return(
      <div>
        <div className="row">
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
              id = {"baseMap"}
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