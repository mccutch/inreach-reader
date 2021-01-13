import React from 'react'
import {TripDisplayButton, MessageDisplayButton} from './objectSummaryButtons.js';


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
        <TripDisplayButton trip={trips[i]} app={this.props.app} onClick={this.props.onClick}/>
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