import React from 'react'
import {ViewerNavbar} from './navBar.js'
import * as urls from './urls.js'
import {apiFetch} from './helperFunctions.js'
import {UserViewer} from './viewerDisplays.js'
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import {SandBox} from './sandbox.js'

export class UserSearch extends React.Component{
  constructor(props){
    super(props)
    this.state={}
    this.findUser=this.findUser.bind(this)
  }

  findUser(){
    this.setState({errorMessage:""})
    apiFetch({
      url:`${urls.VIEW_USER}/${this.state.search}/`,
      method:'GET',
      noAuth:true,
      onSuccess:(json)=>{
        console.log(json)
        console.log(json.user[0].username)
        this.setState({redirect:`${urls.VIEWER}/${json.user[0].username}`})
      },
      onFailure:(message)=>{
        console.log(message)
        this.setState({errorMessage:"Username not found. Username is case sensitive."})
      }
    })
  }

  render(){
    if(this.state.redirect) return <Redirect to={this.state.redirect}/>

    return(
      <div>
        <p>{this.state.errorMessage}</p>
        <input className="form-control" id='search' onChange={(e)=>this.setState({search:e.target.value})} />
        <button className="btn btn-success" onClick={this.findUser} >Search</button>
      </div>
    )
  }
}

export class ViewerApp extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      modal:null,
    }
  }

  
  render(){
    
    let appFunctions = {
      hideModal:()=>this.setState({modal:null}), 
      setModal:(modal)=>this.setState({modal:modal}),
    }

    return(
      <Router>
        {this.state.modal}
        <ViewerNavbar
          userFound={this.state.userFound}
        />
        <Switch>
          <Route 
            path={`${urls.VIEWER}/:username`}
            component={UserViewer}
          />
          <Route exact path={`${urls.VIEWER}`} >
            <UserSearch />
            <SandBox/>
          </Route>
        </Switch>
      </Router>
    )
  }
}