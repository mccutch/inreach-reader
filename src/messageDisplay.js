import React from 'react';
import {MessageDisplayButton} from './objectSummaryViews.js';
import {displayISODate, displayISOTime} from './dateFunctions.js';
import {GoogleMapWrapper} from './googleMap.js';
import {StandardModal} from './reactComponents.js';

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


export class MessageModalView extends React.Component{
  constructor(props){
    super(props)
    this.state = {showOriginal:false}
  }

  render(){
    let message = this.props.message

    let title = <div>{message.sender ? message.sender : "Message"}</div>
    let body = 
      <div>
        <p><strong>{displayISODate(message.date)} - {displayISOTime(message.date)}</strong></p>
        <p>Location: {message.lat},{message.lon}</p>
        <p>{this.state.showOriginal ? message.original : message.message}</p>

        {/*<button className="btn btn-outline-info btn-sm my-1" onClick={()=>this.setState({showOriginal:!this.state.showOriginal})}>
                  <em>{this.state.showOriginal ? "Hide" : "Show original message"}</em>
                </button>*/}
        <GoogleMapWrapper id={"messageMap"} points={[{label:null, position:{lat:message.lat, lng:message.lon}}]}/>
      </div>

    let footer = 
      <div>
        {message.mapshare ? <button className="btn btn-outline-primary"><a href={message.mapshare} target="_blank" rel="noopener noreferrer" >Garmin Mapshare</a></button> : ""}
      </div>

    return <StandardModal title={title} body={body} footer={footer} hideModal={this.props.app.hideModal} />
  }
}