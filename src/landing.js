import React from 'react'
import {GenericNavbar} from './navBar.js'

export class LandingView extends React.Component{
  render(){
    return(
      <div>
        
        <h1>Landing Page</h1>
        <br/>
        <p><strong>Functions</strong></p>
        <ul>
          <li>About</li>
          <li>Login</li>
          <li>Search by user</li>
        </ul>
      </div>
    )
  }
}