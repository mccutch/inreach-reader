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

export class UserSearch extends React.Component{
  constructor(props){
    super(props)
    this.state={}
    this.findUser=this.findUser.bind(this)
  }

  findUser(){
    this.setState({errorMessage:""})
    apiFetch({
      url:`${urls.VIEW_USER}/${this.state.search}/`,
      method:'GET',
      noAuth:true,
      onSuccess:(json)=>{
        console.log(json)
        console.log(json.user[0].username)
        this.setState({redirect:`${urls.VIEWER}/${json.user[0].username}`})
      },
      onFailure:(message)=>{
        console.log(message)
        this.setState({errorMessage:"Username not found. Username is case sensitive."})
      }
    })
  }

  render(){
    if(this.state.redirect) return <Redirect to={this.state.redirect}/>

    return(
      <div>
        <p>{this.state.errorMessage}</p>
        <input className="form-control" id='search' onChange={(e)=>this.setState({search:e.target.value})} />
        <button className="btn btn-success" onClick={this.findUser} >Search</button>
      </div>
    )
  }
}


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
    )
  }
}


