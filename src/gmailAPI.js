import React from 'react';

import { handleAuthClick, handleClientLoad, getSignInStatus, handleSignoutClick, listLabels, listMessages, readFullMessage } from './gapiFunctions.js'

export class GmailAPI extends React.Component{
  constructor(props){
    super(props)
    this.state={
      messageId:"172a9b6b3c09972f",
    }

    this.handleChange=this.handleChange.bind(this)
    this.readMessage=this.readMessage.bind(this)
  }

  componentDidMount(){
    handleClientLoad()
  }

  checkStatus(){
    console.log(getSignInStatus())
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  readMessage(){
    readFullMessage(this.state.messageId)
  }

  render(){

    return(
      <div>
        <h1>Gmail API</h1>
        <button onClick={handleAuthClick}>Sign in</button>
        <button onClick={handleSignoutClick}>Sign out</button>
        <button onClick={this.checkStatus}>Check status</button>
        <button onClick={listLabels}>List labels</button>
        <button onClick={listMessages}>List messages</button>
        <input type="text" name="messageId" onChange={this.handleChange}/>
        <button onClick={this.readMessage} >Read</button>
      </div>
    )
  }
}
