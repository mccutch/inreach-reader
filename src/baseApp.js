import React from 'react'
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import {BaseNavbar} from './navBar.js'
import * as urls from './urls.js'


export class BaseApp extends React.Component{
  constructor(props){
    super(props)
    this.state={}
  }


  render(){
    if(this.state.redirect) return <Redirect to={this.state.redirect}/>

    return(
      <Router>
        <BaseNavbar />
        <Switch>
          <Route path={urls.CONTACT}>
            <p>Contact Page</p>
          </Route>
          <Route path="/">
            <div>
              <p>Welcome Page</p>
              <button className="btn btn-banner" onClick={()=>this.setState({redirect:urls.DASHBOARD})} >Go to Dashboard</button>
              <button className="btn btn-teal" onClick={()=>this.setState({redirect:urls.VIEWER})} >Go to Viewer</button>
            </div>
          </Route>
        </Switch>
      </Router>
    )
  }
}