import React from 'react'
import {TripDisplayButton, MessageDisplayButton, ContactDisplayButton} from './objectSummaryButtons.js';


export class ContactList extends React.Component{
  constructor(props){
    super(props)
    this.buildList=this.buildList.bind(this)
  }

  buildList(){
    let returnList=[]
    let contacts=this.props.contacts
    for(let i in contacts){
      returnList.push(
        <ContactDisplayButton contact={contacts[i]} user={this.props.user} app={this.props.app} actions={this.props.actions}/>
      )
    }
    return returnList
  }
  render(){
    return<div>{this.buildList()}</div>
  }
}

export class TripList extends React.Component{

  constructor(props){
    super(props)
    this.buildList=this.buildList.bind(this)
  }

  buildList(){
    let returnList=[]
    let trips=this.props.trips
    for(let i in trips){
      returnList.push(
        <TripDisplayButton trip={trips[i]} app={this.props.app} onClick={this.props.onClick} actions={this.props.actions}/>
      )
    }
    return returnList
  }
  render(){
    return<div>{this.buildList()}</div>
  }
}


export class MessageList extends React.Component{

  constructor(props){
    super(props)
    this.state={}
    this.buildList=this.buildList.bind(this)
  }

  buildList(){
    let returnList=[]
    let messages=this.props.messages
    for(let i in messages){
      returnList.push(
        <MessageDisplayButton message={messages[i]} app={this.props.app}/>
      )
    }
    return returnList
  }

  render(){

    return(
      <div>
        {this.buildList()}
      </div>
    )
  }
}