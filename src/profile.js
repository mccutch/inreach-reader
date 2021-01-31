import React from 'react'
import {Redirect} from "react-router-dom";

import {GoogleAutocomplete} from './googleAutocomplete.js';
import {apiFetch, truncate} from './helperFunctions.js';
import {LoadingScreen} from './loading.js'
import {EditContact, ViewContact} from './contacts.jsx'
import {ContactList} from './objectSummaryLists.js'

import * as urls from './urls.js';
import { POSITION_DECIMALS, MAX_LEN_NAME } from './constants.js';


export class Profile extends React.Component{
  constructor(props){
    super(props)
    this.state={}
  }

  render(){
    if(this.state.redirect) return <Redirect push={true} to={this.state.redirect}/>
    
    if(!this.props.app.loggedIn){
      return (this.props.app.loginPending ?
        <LoadingScreen/>
        :
        <Redirect push={true} to={urls.HOME} />
      ) 
    }


    let user = this.props.user.user
    let profile = this.props.user.profile

    return(
      this.state.edit ?
      <ProfileEdit app={this.props.app} user={this.props.user} completeEdit={()=>this.setState({edit:false})}/>
      :
      <div>
        <h4>Profile - {user.username}</h4>
        <p>Name: {user.first_name} {user.last_name}</p>
        <p>{user.email}</p>
        <p>Location: {profile.location}</p>
        <h4>Sharing</h4>
        <p>Link: <strong>{window.location.host}/#/view/{user.username}</strong></p>
        <p>Pass phrase: <strong><em>{profile.pass_phrase}</em></strong></p>
        <button className='btn btn-outline-primary m-2' onClick={()=>this.setState({edit:true})}>Edit</button>
        <button className='btn btn-outline-success m-2' onClick={()=>this.setState({redirect:urls.HOME})}>Back</button>
        <h4>Emergency Contacts</h4>
        <ContactList
          app={this.props.app}
          contacts={this.props.user.contacts}
          actions={[
            {label:"View", action:(contact)=>{this.props.app.setModal(<ViewContact contact={contact} user={this.props.user} app={this.props.app}/>)}},
            {label:"Edit", action:(contact)=>{this.props.app.setModal(<EditContact contact={contact} user={this.props.user} app={this.props.app}/>)}},
            {label:"Say hi!", action:(contact)=>{console.log(`Hi ${contact.first_name}!`)}}
          ]}
        />
        <button className='btn btn-outline-success m-2' onClick={()=>{this.props.app.setModal(<EditContact user={this.props.user} app={this.props.app}/>)}}>+ Add</button>
      </div>
    )
  }
}

export class ProfileEdit extends React.Component{
  constructor(props){
    super(props)
    this.state={}

    this.handleChange=this.handleChange.bind(this)
    this.handlePlaceData=this.handlePlaceData.bind(this)
    this.handleLocationData=this.handleLocationData.bind(this)
    this.validateData=this.validateData.bind(this)
    this.updateUserProfile=this.updateUserProfile.bind(this)
    this.handlePatchFailure=this.handlePatchFailure.bind(this)
    this.checkUpdateComplete=this.checkUpdateComplete.bind(this)
  }

  handlePlaceData(place){
    if(!place){
      this.setState({locationData:null})
      return
    }
    console.log(place)
    this.setState({
      location:truncate(place.formatted_address, MAX_LEN_NAME),
      locationData:place.geometry.location.toJSON(),
    })
  }

  handleLocationData(location){
    console.log("Collecting default location using IP address.")
    this.setState({defaultLocationData:location})
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }


  validateData(){
    console.log("No validation applied.")
    this.updateUserProfile()
  }

  updateUserProfile(){
    let userAttr = ['first_name','last_name']
    let profileAttr = ['location', 'pass_phrase']

    let userData={}
    let willUpdateUser=false
    for(let i in userAttr){
      if(this.state[userAttr[i]]){
        userData[userAttr[i]]=this.state[userAttr[i]]
        willUpdateUser=true
      }
    }

    let profileData={}
    let willUpdateProfile=false
    for(let i in profileAttr){
      if(this.state[profileAttr[i]]){
        profileData[profileAttr[i]]=this.state[profileAttr[i]]
        willUpdateProfile=true
      }
    }
    if(this.state.locationData){
      let data = this.state.locationData
      profileData['loc_lat']=parseFloat(data.lat).toFixed(POSITION_DECIMALS)
      profileData['loc_lng']=parseFloat(data.lng).toFixed(POSITION_DECIMALS)
      willUpdateProfile=true
    }
    
    if(willUpdateUser){
      this.setState({userUpdatePending:true})
      apiFetch({
        method:'PATCH',
        url:`${urls.USER}/${this.props.user.user.id}/`,
        data:userData,
        onSuccess:()=>{console.log("User updated"); this.setState({userUpdatePending:false}, this.checkUpdateComplete)},
        onFailure:this.handlePatchFailure,
      })
    }

    if(willUpdateProfile){
      this.setState({profileUpdatePending:true})
      apiFetch({
        method:'PATCH',
        url:`${urls.PROFILE}/${this.props.user.profile.id}/`,
        data:profileData,
        onSuccess:()=>{console.log("Profile updated"); this.setState({profileUpdatePending:false}, this.checkUpdateComplete)},
        onFailure:this.handlePatchFailure,
      })
    }
  }

  checkUpdateComplete(){
    if(this.state.userUpdatePending || this.state.profileUpdatePending){
      console.log("PENDING")
      return
    }
    this.props.app.refresh()
    this.props.completeEdit()
  }

  handlePatchFailure(errorMessage){
    this.setState({errorMessage:errorMessage ? errorMessage:"Unable to save changes."})
  }

  render(){

    if(this.state.redirect) return <Redirect push={true} to={this.state.redirect}/>

    let user = this.props.user.user
    let profile = this.props.user.profile
    return(
      <div>
        <h4>Profile - {user.username}</h4>
        <p>Note: Can't change email or username</p>
        <p>{user.email}</p>
        <input name="first_name" type="text" defaultValue={user.first_name} placeholder="First name" maxLength={MAX_LEN_NAME} onChange={this.handleChange}/>
        <br/>
        <input name="last_name" type="text" defaultValue={user.last_name} placeholder="Last name" maxLength={MAX_LEN_NAME} onChange={this.handleChange}/>
        <br/>
        <GoogleAutocomplete
          id="locationAutocomplete"
          name="location"
          placeholder="Location"
          defaultValue={profile.location}
          maxLength={MAX_LEN_NAME}
          className={`form-control my-2 ${this.state.locationData ? "is-valid" : ""}`}
          returnPlace={this.handlePlaceData}
          returnLocation={this.handleLocationData}
          onChange={this.handleChange}
        />
        <br/>
        <br/>
        <h4>Sharing</h4>
        <p>Link: <strong>{window.location.host}/#/view/{user.username}</strong></p>
        <input name="pass_phrase" type="text" defaultValue={profile.pass_phrase} placeholder="Profile pass phrase" maxLength={MAX_LEN_NAME} onChange={this.handleChange}/>
        <br/>
        <br/>
        <button className='btn btn-outline-success' onClick={this.validateData}>Save changes</button>
        <button className='btn btn-outline-danger' onClick={this.props.completeEdit}>Cancel</button>
      </div>
    )
  }
}