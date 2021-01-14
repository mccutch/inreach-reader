import React from 'react';
import {Redirect} from "react-router-dom";
import * as urls from './urls.js';
import {TripList, MessageList} from './objectSummaryLists.js';


export class Dashboard extends React.Component{
  constructor(props){
    super(props)
    this.state={
    }
  }

  componentDidMount(){
  }

  render(){
    if(this.state.redirect) return(<Redirect push={true} to={this.state.redirect}/>)

    return(
      <div>
        <div className="row">
          <button className="btn btn-outline-primary m-2" onClick={()=>this.setState({redirect:`${urls.PROFILE_SETTINGS}`})}>Profile settings</button>
          <button className="btn btn-outline-primary m-2" onClick={()=>this.setState({redirect:`${urls.PLANNER}`})}>+ Plan a trip</button>
        </div>
        <div className="row">
          <div className="col border">
            <TripList
              trips={this.props.user.trips}
              app={this.props.app}
              actions={[
                {label:"Edit", action:(trip)=>this.setState({redirect:`${urls.PLANNER}/${trip.id}`})},
                {label:"View", action:(trip)=>this.setState({redirect:`${urls.VIEW_TRIP}/${trip.uuid}`})},
              ]}
            />
          </div>
          <div className="col border">
            <MessageList 
              messages={this.props.user.messages} 
              app={this.props.app}
            />
          </div>
        </div>
      </div>
    )
  }
}

