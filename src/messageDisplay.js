import React from 'react';
import {MessageDisplayView} from './objectDisplayViews.js';

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
        <MessageDisplayView message={messages[i]} />
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