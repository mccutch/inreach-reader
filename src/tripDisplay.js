import React from 'react'
import {Link} from 'react-router-dom';
import {CleanLink} from './reactComponents.js';
import {TripDisplayButton} from './objectSummaryViews.js';
import * as urls from './urls.js';

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