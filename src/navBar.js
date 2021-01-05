import React from 'react';
import {Nav} from 'react-bootstrap';
//import {} from './helperFunctions.js';
import {CleanLink} from './reactComponents.js';
import * as urls from './urls.js';




export class BaseNavbar extends React.Component{

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
    let contact = <Nav.Link>
                    <CleanLink to={urls.CONTACT} className="text-light" activeClassName="active" onClick={this.handleClick}>Contact</CleanLink>
                  </Nav.Link>

    let viewer = <Nav.Link>
                    <CleanLink to={urls.VIEWER} className="text-light" activeClassName="active" onClick={this.handleClick}>View</CleanLink>
                  </Nav.Link>

    let dashboard = <Nav.Link>
                    <CleanLink to={urls.DASHBOARD} className="text-light" activeClassName="active" onClick={this.handleClick}>Dashboard</CleanLink>
                  </Nav.Link>


    let navLeft = 
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          {viewer}
          {dashboard}
          {contact}
        </ul>  

    let navColour = (this.props.serverError ? "secondary":"warning")

    return(
      <BootstrapNavBar
        title={`Trip Tracer`}
        icon={urls.GREEN_TEA_ICON}
        onClick={this.props.onClick}
        navLeft={navLeft}
        navRight={null}
        navColour={navColour}
        style={'navbar-light'}
        homeUrl={urls.HOME}
        collapsed={this.state.collapsed}
        toggle={()=>{this.setState({collapsed:!this.state.collapsed})}}
      />
    )
  }
}



export class ViewerNavbar extends React.Component{

  constructor(props){
    super(props)
    this.state={collapsed:true}
    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    this.setState({collapsed:true})
    this.props.onClick(event.target.name)
  }

  render(){
    // All users
    let contact = <Nav.Link>
                    <CleanLink to={urls.CONTACT} className="text-light" activeClassName="active" onClick={this.handleClick}>Contact</CleanLink>
                  </Nav.Link>

    let logout = <Nav.Link key="logout" name="logout"  className="text-light" onClick={this.handleClick}>Logout</Nav.Link>

    let navLeft
    let navRight
    if(this.props.loggedIn){
      navLeft = 
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          {contact}
        </ul>  
      navRight = 
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          {logout}
        </ul>
    } else {
      navLeft = 
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          {contact}
        </ul>
    }

    let navColour = (this.props.serverError ? "secondary":"teal")

    return(
      <BootstrapNavBar
        title={`Trip Tracer${this.props.username&&` - ${this.props.username}`}`}
        icon={urls.GREEN_TEA_ICON}
        onClick={this.props.onClick}
        navLeft={navLeft}
        navRight={navRight}
        navColour={navColour}
        style={'navbar-dark'}
        homeUrl={urls.VIEWER}
        collapsed={this.state.collapsed}
        toggle={()=>{this.setState({collapsed:!this.state.collapsed})}}
      />
    )
  }
}





export class DashboardNavbar extends React.Component{

  constructor(props){
    super(props)
    this.state={collapsed:true}
    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    this.setState({collapsed:true})
    this.props.onClick(event.target.name)
  }

  render(){
    // All users
    let contact = <Nav.Link>
                    <CleanLink to={urls.CONTACT} className="text-light" activeClassName="active" onClick={this.handleClick}>Contact</CleanLink>
                  </Nav.Link>

    let demoUser = <Nav.Link key="demoUser" name="demoUser" className="text-light" onClick={this.handleClick}>Demo User</Nav.Link>

    let logout = <Nav.Link key="logout" name="logout"  className="text-light" onClick={this.handleClick}>Logout</Nav.Link>

  
    // Unauthenticated users
    let login = <Nav.Link key="login" name="login" className="text-light" onClick={this.handleClick}>Login</Nav.Link>
    let signUp = <Nav.Link key="signUp" name="register" className="text-light" onClick={this.handleClick}>Sign up</Nav.Link>
    let planner = <Nav.Link>
                    <CleanLink to={urls.PLANNER} className="text-light" activeClassName="active" onClick={this.handleClick}>Plan a Trip</CleanLink>
                  </Nav.Link>
    

    let navLeft
    let navRight
    if(this.props.loggedIn){
      navLeft = 
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          {planner}
          {contact}
        </ul>  
      navRight = 
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          {logout}
        </ul>
    } else {
      navLeft = 
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          {login}
          {signUp}
          {demoUser}
          {contact}
        </ul>
    }

    let navColour = (this.props.serverError ? "secondary":"banner")

    return(
      <BootstrapNavBar
        title={"Trip Tracer Dashboard"}
        icon={urls.BEAR_ICON}
        onClick={this.props.onClick}
        navLeft={navLeft}
        navRight={navRight}
        navColour={navColour}
        style={'navbar-dark'}
        homeUrl={urls.DASHBOARD}
        collapsed={this.state.collapsed}
        toggle={()=>{this.setState({collapsed:!this.state.collapsed})}}
      />
    )
  }
}

export class BootstrapNavBar extends React.Component{

  render(){

    return(
      <nav className={`navbar navbar-expand-lg ${this.props.style} bg-${this.props.navColour}`}>
        <a className="navbar-brand">
          <img
            alt=""
            src={this.props.icon}
            width="40"
          />{' '}
          <CleanLink className="text-light" to={this.props.homeUrl} onClick={this.handleClick}>{this.props.title}</CleanLink>
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          //dataToggle="collapse" 
          //dataTarget="#navbarTogglerDemo02" 
          //ariaControls="navbarTogglerDemo02" 
          //ariaExpanded="false" 
          ariaLabel="Toggle navigation"
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