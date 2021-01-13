import React from 'react';
import * as urls from './urls.js';
import {displayISODate, displayISOTime} from './dateFunctions.js';
import {MessageModalView} from './messageDisplay.js';


class ObjectDisplayButton extends React.Component{

  render(){
    let icon = 
      <div className="col-2" style={{height:"2.5rem"}}>
        <img
          alt={""}
          src={this.props.iconSrc ? this.props.iconSrc : urls.CO2_ICON}
          height="110%"
          style={{margin: "0px 0px 0px -0.5rem"}}
        />
      </div>

    return(
      <button className="btn btn-outline-primary btn-block my-1" onClick={this.props.onClick}>
        <div className="row" style={{height:"2.5rem"}}>
          {icon}
          <div className="col-10">
              <div className="row">
                <div className="col text-truncate text-left"  style={{margin: "0rem 0rem 0rem -0.25rem"}}>
                  <strong>{this.props.primaryText}</strong>
                </div>
                <div className="col-auto text-center">
                  <strong>{this.props.primaryRight}</strong>
                </div>
              </div>
              <div className="row" style={{height:"1rem"}}>
                <div className="col text-truncate text-left"  style={{margin: "-0.5rem 0rem 0rem -0.25rem"}}>
                  <small>{this.props.secondaryText}</small>
                </div>
                <div className="col-auto text-center" style={{margin: "-0.5rem 0rem 0rem 0rem"}}>
                      <small>{this.props.secondaryRight}</small>           
                </div>
              </div>
          </div>
        </div>
      </button>
    )
  }
}

export class MessageDisplayButton extends React.Component{
  render(){
    let message = this.props.message

    return (
      <ObjectDisplayButton
        primaryText={`${displayISODate(message.date)}`}
        secondaryText={message.message}
        primaryRight={`${displayISOTime(message.date)}`}
        secondaryRight={``}
        iconSrc={urls.HELICOPTER_ICON}
        onClick={this.props.onClick ? this.props.onClick :
          ()=>{this.props.app.setModal(<MessageModalView message={this.props.message} app={this.props.app}/>)}
        }
      />
    )
  }
}

export class TripDisplayButton extends React.Component{
  render(){
    let trip = this.props.trip

    return (
      <ObjectDisplayButton
        primaryText={`${trip.name}`}
        secondaryText={`${displayISODate(trip.departs)}-${displayISODate(trip.returns)}`}
        primaryRight={``}
        secondaryRight={``}
        iconSrc={urls.MOTORBIKE_ICON}
        onClick={this.props.onClick ? 
                  ()=>this.props.onClick(this.props.trip)
                  : 
                  null
                }
      />
    )
  }
}






