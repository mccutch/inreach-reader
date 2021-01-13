import React from 'react';
import {Nav} from 'react-bootstrap';
//import {} from './helperFunctions.js';
import {CleanLink} from './reactComponents.js';
import * as urls from './urls.js';

const LOGIN_COLOUR = "teal"
const PUBLIC_COLOUR = "info"
const ERROR_COLOUR = "secondary"

export class GenericNavbar extends React.Component{
  constructor(props){
    super(props)
    this.state={collapsed:true}
    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    this.setState({collapsed:true})
    if(this.props.onClick){this.props.onClick(event.target.name)}
  }

  render(){
    // All users
    let home =  <Nav.Link>
                  <CleanLink to={urls.HOME} className="text-light" activeClassName="active" onClick={this.handleClick}>Home</CleanLink>
                </Nav.Link>

    let contact = <Nav.Link>
                    <CleanLink to={urls.CONTACT} className="text-light" activeClassName="active" onClick={this.handleClick}>Contact</CleanLink>
                  </Nav.Link>

    let viewer = <Nav.Link>
                    <CleanLink to={urls.VIEWER} className="text-light" activeClassName="active" onClick={this.handleClick}>View</CleanLink>
                  </Nav.Link>

    let demoUser = <Nav.Link key="demoUser" name="demoUser" className="text-light" onClick={this.handleClick}>Demo User</Nav.Link>

    let login = <Nav.Link key="login" name="login" className="text-light" onClick={this.handleClick}>Login</Nav.Link>
    
    let signUp = <Nav.Link key="signUp" name="register" className="text-light" onClick={this.handleClick}>Sign up</Nav.Link>

    //Logged in

    let planner = <Nav.Link>
                    <CleanLink to={urls.PLANNER} className="text-light" activeClassName="active" onClick={this.handleClick}>Plan a Trip</CleanLink>
                  </Nav.Link>

    let profile = <Nav.Link>
                    <CleanLink to={urls.PROFILE_SETTINGS} className="text-light" activeClassName="active" onClick={this.handleClick}>Settings</CleanLink>
                  </Nav.Link>

    let logout = <Nav.Link key="logout" name="logout"  className="text-light" onClick={this.handleClick}>Logout</Nav.Link>


    let navLeft, navRight

    if(this.props.app.loggedIn){
      navLeft = 
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          {home}
          {planner}
          {profile}
          {contact}
        </ul> 
      navRight = 
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          {logout}
        </ul>
      
    }else{
      navLeft = 
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          {home}
          {viewer}
          {demoUser}
          {login}
          {signUp}
          {contact}
        </ul>
    }

    let navColour=(this.props.app.serverError ? ERROR_COLOUR:(this.props.app.loggedIn ? LOGIN_COLOUR:PUBLIC_COLOUR))

    return(
      <BootstrapNavBar
        title={`HomeSoon`}
        icon={urls.GREEN_TEA_ICON}
        onClick={this.props.onClick}
        navLeft={navLeft}
        navRight={navRight}
        navColour={navColour}
        styleString={'navbar-light'}
        homeUrl={urls.HOME}
        collapsed={this.state.collapsed}
        toggle={()=>{this.setState({collapsed:!this.state.collapsed})}}
      />
    )
  }
}




export class BootstrapNavBar extends React.Component{

  render(){
    return(
      <nav className={`navbar navbar-expand-lg ${this.props.styleString} bg-${this.props.navColour}`}>
        <button className="navbar-brand btn bg-transparent">
          <img
            alt=""
            src={this.props.icon}
            width="40"
          />{' '}
          <CleanLink className="text-light" to={this.props.homeUrl} onClick={this.handleClick}>{this.props.title}</CleanLink>
        </button>
        <button 
          className="navbar-toggler" 
          type="button"
          onClick={this.props.toggle}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse ${this.props.collapsed?'collapse':""}`}>
          {this.props.navLeft}
          {this.props.navRight}
        </div>
      </nav>
    )
  }
}