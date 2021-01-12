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
    this.state={}
  }

  render(){
    let title = <div>{this.props.username} - Restricted view</div>
    let body = 
    <form>
      <p><strong>{this.props.errorMessage}</strong></p>
      <input id="phrase" type="text" className='form-control my-2'/>
      <button 
        className='btn btn-outline-primary my-2'
        onClick={(e)=>{
          e.preventDefault()
          let phrase = document.getElementById('phrase').value
          console.log(phrase)       
          this.props.viewer.setPhrase(phrase, this.props.onSuccess)
          this.props.app.hideModal()
        }}
      >Submit</button>
    </form>
    
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
    }
    this.fetchUserData=this.fetchUserData.bind(this)
    this.displayError=this.displayError.bind(this)
  }

  componentDidMount(){
    this.fetchUserData()
  }

  authenticateViewer(message){
    this.props.app.setModal(<ViewerAuthenticator app={this.props.app} viewer={this.props.viewer} username={this.props.userParam} onSuccess={this.fetchUserData} errorMessage={message}/>)
  }

  fetchUserData(){
    this.setState({notFound:false})
    apiFetch({
      url:`${urls.USER_READ_ONLY}/${this.props.userParam}/`,
      method:'POST',
      noAuth:true,
      data:{pass_phrase:this.props.viewer.phrase},
      onSuccess:(json)=>{
        this.setState({
          user:json.user[0],
          trips:json.trips,
          messages:json.messages,
        })
      },
      onFailure:(err)=>{
        console.log(err)
        if(err==='404'){
          this.props.app.setModal(<StandardModal title={<div>Error</div>} body={<p>{`Unable to find user account ${this.props.userParam}.`}</p>} hideModal={this.props.app.hideModal}/>)
          console.log("No user account found. Send back to search.")
          this.setState({redirect:urls.VIEWER})
        }else if(err==='403'){
          console.log("Bad pass phrase. Reauthentication required.")
          this.props.viewer.setPhrase(null)
          this.authenticateViewer("Incorrect. Please try again.")
        }else if(err==='406'){
          console.log("Pass phrase required.")
          this.authenticateViewer("Please enter pass phrase to view user profile.")
        }     
      },
    })
  }

  displayError(message){
    
  }

  render(){

    if(this.state.redirect) return <Redirect push={true} to={this.state.redirect}/>

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


