import React from 'react'
import {TripDisplayButton, ContactDisplayButton} from './objectSummaryButtons.jsx';


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
        <TripDisplayButton key={trips[i].id} trip={trips[i]} app={this.props.app} onClick={this.props.onClick} actions={this.props.actions}/>
      )
    }
    return returnList
  }
  render(){
    return<div>{this.buildList()}</div>
  }
}
