import React from 'react'
import {ViewerNavbar} from './navBar.js'
import * as urls from './urls.js'
import {apiFetch} from './helperFunctions.js'
import {MessageList} from './messageDisplay.js';
import {TripList} from './tripDisplay.js'

export class ViewerApp extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      username:this.props.match.params.username,
      modal:null,
    }
    this.fetchUserData=this.fetchUserData.bind(this)
    this.setModal=this.setModal.bind(this)
    this.hideModal=this.hideModal.bind(this)
  }

  setModal(modal){this.setState({modal:modal})}

  hideModal(){this.setModal(null)}

  componentDidMount(){
    this.fetchUserData()
  }

  componentDidUpdate(prevProps){
    if(this.props.match.params.username !== prevProps.match.params.username){
      this.setState({
        username:this.props.match.params.username,
      },this.fetchUserData)
      
    }
  }

  fetchUserData(){
    apiFetch({
      url:`${urls.VIEW_USER}/${this.state.username}/`,
      method:'GET',
      noAuth:true,
      onSuccess:(json)=>{
        this.setState({
          display:true,
          userData:json.user[0],
          trips:json.trips,
          messages:json.messages,
        })
      },
      onFailure:(err)=>{
        console.log(err)
      },
    })
  }


  render(){
    let appFunctions = {
      refresh:this.fetchUserData,
      hideModal:this.hideModal, 
      setModal:this.setModal,
    }
    return(
      <div>
        {this.state.modal}
        <ViewerNavbar username={this.state.user ? this.state.user : ""}/>
        <p>This is the viewer app</p>
        <p>Searching for: {this.state.username}</p>
        <p>{this.state.userData ? JSON.stringify(this.state.userData) : ''}</p>
        {this.state.display?
          <div>
            <TripList 
              viewOnly={true}
              trips={this.state.trips}
              app={appFunctions}
            />
            <MessageList 
              messages={this.state.messages}
              app={appFunctions}
            />
          </div>
          :""
        }
      </div>
    )
  }
}