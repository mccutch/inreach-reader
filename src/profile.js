import React from 'react'
import {Redirect} from "react-router-dom";

import {FormRow} from './reactComponents.js'
import { GoogleAutocomplete} from './googleAutocomplete.js';
import {apiFetch} from './helperFunctions.js';

import * as urls from './urls.js';
import { POSITION_DECIMALS, MAX_LEN_NAME } from './constants.js';

export class Profile extends React.Component{
  constructor(props){
    super(props)
    this.state={}

    this.handleChange=this.handleChange.bind(this)
    this.handlePlaceData=this.handlePlaceData.bind(this)
    this.handleLocationData=this.handleLocationData.bind(this)
    this.validateData=this.validateData.bind(this)
    this.updateUserProfile=this.updateUserProfile.bind(this)
    this.handlePatchFailure=this.handlePatchFailure.bind(this)
  }

  handlePlaceData(place){
    if(!place){
      this.setState({locationData:null})
      return
    }
    console.log(place)
    this.setState({
      location:place.formatted_address,
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
    console.log("No validations applied")
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
      apiFetch({
        method:'PATCH',
        url:`${urls.USER}/${this.props.user.user.id}/`,
        data:userData,
        onSuccess:this.props.app.refresh,
        onFailure:this.handlePatchFailure,
      })
    }

    if(willUpdateProfile){
      apiFetch({
        method:'PATCH',
        url:`${urls.PROFILE}/${this.props.user.profile.id}/`,
        data:profileData,
        onSuccess:this.props.app.refresh,
        onFailure:this.handlePatchFailure,
      })
    }
  }

  handlePatchFailure(errorMessage){
    this.setState({errorMessage:errorMessage ? errorMessage:"Unable to save changes."})
  }

  render(){

    if(this.state.redirect) return <Redirect push={true} to={this.state.redirect}/>
    if(!this.props.user.user) return <p>Loading profile...</p>

    let user = this.props.user.user
    let profile = this.props.user.profile
    return(
      <div>
        <h4>Profile</h4>
        <p>Note: Can't change email or username</p>
        <p>{user.username}</p>
        <p>{user.email}</p>
        <input name="first_name" type="text" defaultValue={user.first_name} placeholder="First name" maxLength={MAX_LEN_NAME} onChange={this.handleChange}/>
        <br/>
        <input name="last_name" type="text" defaultValue={user.last_name} placeholder="Last name" maxLength={MAX_LEN_NAME} onChange={this.handleChange}/>
        <br/>
        <GoogleAutocomplete
          id="locationAutocomplete"
          name="location"
          placeholder="Location"
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
        <button className='btn btn-outline-danger' onClick={()=>this.setState({redirect:urls.HOME})}>Cancel</button>
      </div>
    )
  }
}