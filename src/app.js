import React from 'react';
import {DashboardNavbar} from './navBar.js';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import * as urls from './urls.js';
import {clearToken} from './myJWT.js';
import {LoginForm, demoLogin} from './loginWrapper.js';
import {RegistrationForm} from './registrationForm.js';
import {apiFetch, getObject} from './helperFunctions.js';
import {MessageList} from './messageDisplay.js';
import {TripList} from './tripDisplay.js'
import {TripPlanner} from './tripPlanner.js';
import {GoogleMapWrapper} from './googleMap.js';
/*
Login Process
1. Get JWT access token
2. Fetch user profile from api/login
3. Set this.state.loggedIn
*/

export class DashboardApp extends React.Component{
  constructor(props){
    super(props)
    this.state={
      loggedIn:false,
      modal:null,
      editTrip:null,
    }
    this.setModal=this.setModal.bind(this)
    this.hideModal=this.hideModal.bind(this)
    this.handleLoginSuccess=this.handleLoginSuccess.bind(this)
    this.handleLogout=this.handleLogout.bind(this)
    this.handleNavClick=this.handleNavClick.bind(this)
    this.fetchUserProfile=this.fetchUserProfile.bind(this)
    this.editTrip=this.editTrip.bind(this)
  }

  componentDidMount(){
    this.fetchUserProfile()
  }

  fetchUserProfile(){
    apiFetch({
      url:urls.LOGIN,
      method:'GET',
      onSuccess:(data)=>{
        this.setState({
          user:data.user,
          profile:data.profile,
          messages:data.messages,
          trips:data.trips,
        }, this.handleLoginSuccess)
      }
    })
  }

  setModal(modal){this.setState({modal:modal})}

  hideModal(){this.setModal(null)}

  handleLoginSuccess(){
    console.log("Login success")
    this.setState({loggedIn:true})
    this.hideModal()
  }

  handleLogout(){
    clearToken({
      onSuccess:()=>{
        console.log("Logout success..")
        window.location.reload(false)
      }
    })
  }

  handleNavClick(nav){
    this.fetchUserProfile()
    if(nav==="login"){
      this.setModal(<LoginForm onSuccess={this.fetchUserProfile} hideModal={this.hideModal}/>)
    }else if(nav==="logout"){
      this.handleLogout()
    }else if(nav==="demoUser"){
      demoLogin({onSuccess:this.fetchUserProfile})
    }else if(nav==="register"){
      this.setModal(<RegistrationForm onSuccess={this.fetchUserProfile} hideModal={this.hideModal}/>)
    }
  }

  editTrip(trip){
    this.setState({
      editTrip:trip,
    })
  }

  render(){
    let appFunctions = {
      refresh:this.fetchUserProfile,
      hideModal:this.hideModal, 
      setModal:this.setModal,
    }

    return(
      <Router>     
        <DashboardNavbar
          loggedIn={this.state.loggedIn}
          onClick={this.handleNavClick}
        />
        {this.state.modal}
        <Switch>
            <Route exact path={urls.DASHBOARD}>
              {this.state.loggedIn ?
                <div>
                  <p>Hola {this.state.user.username}</p>
                  <TripList
                    trips={this.state.trips}
                    app={appFunctions}
                    onClick={this.editTrip}
                  />
                  <MessageList 
                    messages={this.state.messages} 
                    app={appFunctions}
                  />
                </div>
                :
                <p>HOla guest</p>
              }
            </Route>
            <Route path={urls.CONTACT}>
              <p>contact</p>
            </Route>
            <Route path={urls.PLANNER}>
              <TripPlanner
                trip={this.state.editTrip}
                app={appFunctions}
              />
            </Route>
            
            <Route path="*">
              <p>Sorry, not found</p>
            </Route>
        </Switch>
      </Router>
      )
  }
}