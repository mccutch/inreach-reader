import React from 'react';
import {Nav} from 'react-bootstrap';
//import {} from './helperFunctions.js';
import {CleanLink} from './reactComponents.js';
import * as urls from './urls.js';



export class BootstrapNavBar extends React.Component{
  constructor(props){
    super(props)
    this.state={collapsed:true}
    this.handleClick=this.handleClick.bind(this)
  }

  handleClick(event){
    this.props.app.refresh()
    this.setState({collapsed:true})
    console.log(event.target.name)
    this.props.onClick(event.target.name)
  }

  render(){


    // All users
    //let about = <NavLink to="/about" activeClassName="active">About</NavLink>/*<Nav.Link key="about" name="about" onClick={this.handleClick}>About</Nav.Link>*/
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
      <nav className={`navbar navbar-expand-lg navbar-dark bg-${navColour}`}>
        <a className="navbar-brand">
          <img
            alt=""
            src={urls.BEAR_ICON}
            width="40"
            //height="50"
            //className="d-inline-block align-middle"
          />{' '}
          <CleanLink className="text-light" to="/" onClick={this.handleClick}>Backcountry Trip Tracer</CleanLink>
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          dataToggle="collapse" 
          dataTarget="#navbarTogglerDemo02" 
          ariaControls="navbarTogglerDemo02" 
          ariaExpanded="false" 
          ariaLabel="Toggle navigation"
          onClick={()=>{this.setState({collapsed:!this.state.collapsed})}}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse ${this.state.collapsed?'collapse':""}`} id="navbarTogglerDemo02">
          {navLeft}
          {navRight}
        </div>
      </nav>
    )
  }
}