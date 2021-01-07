import React from 'react';

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

import {GenericNavbar} from './navBar.js';
import {UserViewer, UserSearch} from './viewerDisplays.js';
import {TripViewer} from './tripView.js';
import {Dashboard} from './dashboard.js';
import {LandingView} from './landing.js';
import {ContactView} from './contact.js';
import {TripEdit, TripPlanner} from './tripPlanner.js';
/*
Login Process
1. Get JWT access token
2. Fetch user profile from api/login
3. Set this.state.loggedIn
*/


export class AppRouter extends React.Component{
  constructor(props){
    super(props)
    this.state={
      loggedIn:false,
    }
    this.setModal=this.setModal.bind(this)
    this.hideModal=this.hideModal.bind(this)
    this.handleLoginSuccess=this.handleLoginSuccess.bind(this)
    this.handleLogout=this.handleLogout.bind(this)
    this.handleNavClick=this.handleNavClick.bind(this)
    this.fetchUserProfile=this.fetchUserProfile.bind(this)
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
    this.setState({redirect:urls.HOME})
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

  render(){
    let appFunctions = {
      refresh:this.fetchUserProfile,
      hideModal:this.hideModal, 
      setModal:this.setModal,
      loggedIn:this.state.loggedIn,
    }

    let userData = {
      user:this.state.user,
      profile:this.state.profile,
      messages:this.state.messages,
      trips:this.state.trips,
    }

    if(this.state.redirect){
      let to = this.state.redirect
      this.setState({redirect:null})
      return <Redirect to={to}/>
    }

    return(
      <Router>     
        {this.state.modal}
        <GenericNavbar app={appFunctions} onClick={this.handleNavClick}/>
        <Switch>
            <Route path={urls.CONTACT}>
              <ContactView />
            </Route>


            <Route 
              path={`${urls.VIEWER}/:username`}
              component={UserViewer}
            />

            <Route 
              path={urls.VIEWER}
              component={UserSearch}
            />

            <Route 
              path={`${urls.PLANNER}/:tripId`}
              render={(router) => <TripEdit tripId={router.match.params.tripId} app={appFunctions} user={userData}/>}
            />

            <Route 
              path={urls.PLANNER}
              render={() => <TripPlanner app={appFunctions} />}
            />

            <Route 
              path={`${urls.TRIP}/:tripId`}
              component={TripViewer}
            />

            <Route path={urls.HOME}>
              <div>
              {this.state.loggedIn ?
                <Dashboard app={appFunctions} user={userData} />
                :
                <LandingView />
              }
              </div>
            </Route>

            <Route path="*">
              <Redirect to={urls.HOME}/>
            </Route>
        </Switch>
      </Router>
      )
  }


}





