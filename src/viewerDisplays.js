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
import {StandardModal} from './reactComponents.js'


export class ViewerAuthenticator extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    let title = <div>Authenticate Viewer</div>
    let body = <button onClick={()=>this.props.approveForUser(8)}>Authenticate for DemoUser</button>

    return(<StandardModal title={title} body={body} hideModal={this.props.app.hideModal}/>)
  }
}

export class UserSearch extends React.Component{
  constructor(props){
    super(props)
    this.state={}
    this.findUser=this.findUser.bind(this)
  }

  findUser(){
    this.setState({errorMessage:""})
    apiFetch({
      url:`${urls.USER_READ_ONLY}/${this.state.search}/`,
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
    if(this.state.redirect) return <Redirect push={true} to={this.state.redirect}/>

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
      url:`${urls.USER_READ_ONLY}/${this.state.userParam}/`,
      method:'POST',
      noAuth:true,
      data:{pass_phrase:"Let me in."},
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
          onClick={(trip)=>this.setState({redirect:`${urls.VIEW_TRIP}/${trip.uuid}`})}
        />
        <MessageList 
          messages={this.state.messages}
          app={this.props.app}
        />
      </div> 
    )
  }
}


