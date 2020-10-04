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
        console.log("Logout success.")
        window.location.reload(false)
      }
    })
  }

  handleNavClick(nav){
    if(nav==="login"){
      this.setModal(<LoginForm onSuccess={this.handleLoginSuccess} hideModal={this.hideModal}/>)
    }else if(nav==="logout"){
      this.handleLogout()
    }else if(nav==="demoUser"){
      demoLogin({onSuccess:this.handleLoginSuccess})
    }else if(nav==="register"){
      this.setModal(<RegistrationForm onSuccess={this.handleLoginSuccess} hideModal={this.hideModal}/>)
    }
  }

  render(){

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
              <p>Hola</p>
            </Route>
            <Route path={urls.CONTACT}>
              <p>contact</p>
            </Route>
        </Switch>
      </Router>
      )
  }
}