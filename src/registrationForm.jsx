import React from 'react';
import { getToken }  from './myJWT.js';

import { apiFetch } from './helperFunctions.js';
import { StandardModal} from './reactComponents.jsx';

import { PasswordInput, PasswordCheckInput, UsernameInput, EmailInput} from './validation.jsx';
import * as validation from './validation.jsx';

import { POSITION_DECIMALS, MAX_LEN_NAME } from './constants.js';
import { GoogleAutocomplete} from './googleAutocomplete.jsx';

import * as urls from './urls.js';

export class RegistrationForm extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      username: "",
      location: "",
      date_of_birth: "",
      password: "",
      password_check: null,
      email: "",
      errorMessage:"",
      strongPassword: false,
      validEmail:false,
      validUsername:false,
      submitted:false,
    }


    this.handleChange=this.handleChange.bind(this)
    this.handleLocationData=this.handleLocationData.bind(this)
    this.handlePlaceData=this.handlePlaceData.bind(this)

    this.validateUserData=this.validateUserData.bind(this)
    this.createUser=this.createUser.bind(this)
    this.createProfile=this.createProfile.bind(this)

    this.createProfileFailure=this.createProfileFailure.bind(this)
    this.createUserFailure=this.createUserFailure.bind(this)
    this.createUserSuccess=this.createUserSuccess.bind(this)
    this.handleUnique=this.handleUnique.bind(this)
    
    this.returnError=this.returnError.bind(this)
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  setStrongPassword(bool){this.setState({strongPassword:bool})}
  setPasswordsMatch(bool){this.setState({passwordsMatch:bool})}
  setValidUsername(bool){this.setState({validUsername:bool})}
  setValidEmail(bool){this.setState({validEmail:bool})}

  returnError(errorMessage){
    this.setState({
      errorMessage:errorMessage,
      submissionPending:false,
    })
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

  validateUserData(){
    //event.preventDefault()
    this.setState({
      errorMessage:"",
      submitted:true,
      submissionPending:true,
    })
    // Insert reCAPTCHAv2?

    // Check required inputs
    if(!this.state.username || !this.state.password){
      this.returnError("Fill in required fields.")
      return
    }
    // Validate username regex
    if(!this.state.validUsername){
      this.returnError(validation.USERNAME_ERR)
      return
    }
    // Validate password
    if(!this.state.strongPassword){
      this.returnError(validation.PASSWORD_ERR)
      return
    }
    if(!this.state.passwordsMatch){
      this.returnError(validation.PASSWORD_CHECK_ERR)
      return
    }
    if(!this.state.validEmail){
      this.returnError(validation.EMAIL_ERR)
      return
    }

    // Check uniqueness of username and password
    validation.checkUniqueUser({
      username:this.state.username,
      email:this.state.email,
      onSuccess:this.handleUnique,
      onFailure:this.createUserFailure,
    })
  }

  handleUnique(json){
    if(json.uniqueUsername===false){
      this.returnError("Username is already in use.")
      this.setState({validUsername:false})
    } else if(json.uniqueEmail===false){
      this.returnError("Email is already in use.")
      this.setState({validEmail:false})
    } else {
      this.createUser()
    }
  }

  createUser(){
    let userData = {
      username: this.state.username,
      password: this.state.password,
      email: this.state.email,
    }
    console.log(userData)

    apiFetch({
      method:'POST',
      url:urls.REGISTER,
      data:userData,
      onSuccess:this.createUserSuccess,
      onFailure:this.createUserFailure,
      noAuth:true,
    })
  }

  createUserFailure(message){
    this.returnError("Unable to create user.")
  }

  createUserSuccess(json){
    console.log(json)
    this.setState({userId:json.id})
    console.log("Create user - Success")
    let loginData = {username: this.state.username, password: this.state.password}
    getToken({data:loginData, onSuccess:this.createProfile})
  }

  createProfile(){
    let profileData = {}
    let profileAttributes = ["location"]

    for(let i in profileAttributes){
      if(this.state[profileAttributes[i]]){
        profileData[profileAttributes[i]]=this.state[profileAttributes[i]]
      }
    }
    if(this.state.locationData || this.state.defaultLocationData){
      let data = this.state.locationData ? this.state.locationData : this.state.defaultLocationData
      profileData['loc_lat']=parseFloat(data.lat).toFixed(POSITION_DECIMALS)
      profileData['loc_lng']=parseFloat(data.lng).toFixed(POSITION_DECIMALS)
    }
    console.log(profileData)

    apiFetch({
      method:'POST',
      url:urls.MY_PROFILE,
      data:profileData,
      onSuccess:this.props.onSuccess,
      onFailure:this.createProfileFailure,
    })
  }

  createProfileFailure(message){
    this.returnError("Error occurred while creating profile. Please try again.")
    let key = this.state.userId
    apiFetch({
      url:`${urls.USER}/${key}/`,
      method:'DELETE',
      onSuccess:()=>console.log("User account deleted. Ready to try again."),
      onFailure:()=>console.log("User account not deleted."),
    })
  }

  render(){
    let title = <div>Sign Up</div>

    let body = 
      <form>
        <h5>Account</h5>
        <UsernameInput
          value={this.state.username}
          isValid={this.state.validUsername}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={(bool)=>{this.setState({validUsername:bool})}}
          className="my-2"
        />
        <PasswordInput
          value={this.state.password}
          isValid={this.state.strongPassword}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={(bool)=>{this.setState({strongPassword:bool})}}
          className="my-2"
        />
        <PasswordCheckInput
          value={this.state.password_check}
          checkValue={this.state.password}
          isValid={this.state.passwordsMatch}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={(bool)=>{this.setState({passwordsMatch:bool})}}
          className="my-2"
        />
        <EmailInput
          value={this.state.email}
          isValid={this.state.validEmail}
          submitted={this.state.submitted}
          onChange={this.handleChange}
          returnValidation={(bool)=>{this.setState({validEmail:bool})}}
          className="my-2"
        />   
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
        <small className="form-text text-muted">Location is optional improves your search results.</small>
        <p><strong>{this.state.errorMessage}</strong></p>
      </form>

    let footer =  
      <div>
        <button className="btn btn-outline-danger m-2" onClick={this.props.hideModal}>Cancel</button>
        <button className={`btn btn-success m-2 ${this.state.submissionPending ? "disabled":""}`} onClick={this.validateUserData}>Create account</button>
      </div>

    return <StandardModal hideModal={this.props.hideModal} title={title} body={body} footer={footer} />
  }
}