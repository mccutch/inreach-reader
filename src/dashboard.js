import React from 'react';
import {DashboardNavbar} from './navBar.js';
import {Redirect} from "react-router-dom";
import * as urls from './urls.js';
import {clearToken} from './myJWT.js';
import {LoginForm, demoLogin} from './loginWrapper.js';
import {RegistrationForm} from './registrationForm.js';
import {apiFetch, getObject} from './helperFunctions.js';
import {MessageList} from './messageDisplay.js';
import {TripList} from './tripDisplay.js'
import {TripPlanner} from './tripPlanner.js';
import {GoogleMapWrapper} from './googleMap.js';

import { withRouter } from 'react-router-dom'



export class Dashboard extends React.Component{
  constructor(props){
    super(props)
    this.state={
    }
  }

  componentDidMount(){
  }

  render(){
    if(this.state.redirect) return(<Redirect push={true} to={this.state.redirect}/>)

    return(
      <div>
        <p>Hola</p>
        <TripList
          trips={this.props.user.trips}
          app={this.props.app}
          onClick={
            (trip)=>{
              console.log('click')
              this.setState({redirect:`${urls.VIEW_TRIP}/${trip.uuid}`})
            }
          }
        />
        <MessageList 
          messages={this.props.user.messages} 
          app={this.props.app}
        />
      </div>
    )
  }
}

