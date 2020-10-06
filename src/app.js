import React from 'react';
import {BootstrapNavBar} from './navBar.js';
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
import {apiFetch} from './helperFunctions.js';
import {MessageList} from './messageDisplay.js';
import {TripPlanner} from './tripPlanner.js';

/*
Login Process
1. Get JWT access token
2. Fetch user profile from api/login
3. Set this.state.loggedIn
*/

export class App extends React.Component{
  constructor(props){
    super(props)
    this.state={
      loggedIn:false,
      modal:null,
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
      hideModal:this.hideModal, 
      setModal:this.setModal,
    }

    return(
      <Router>
        <BootstrapNavBar
          loggedIn={this.state.loggedIn}
          setModal={this.setModal}
          hideModal={this.hideModal}
          onClick={this.handleNavClick}
        />
        {this.state.modal}
        <Switch>
            <Route exact path={urls.HOME}>
              {this.state.loggedIn ?
                <div>
                  <p>Hola {this.state.user.username}</p>
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
                app={appFunctions}
              />
            </Route>
        </Switch>
      </Router>
      )
  }
}