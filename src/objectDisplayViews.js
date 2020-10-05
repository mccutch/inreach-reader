import React from 'react';
import {Badge} from 'react-bootstrap';
import * as urls from './urls.js';
import {getAttribute} from './helperFunctions.js';
import {getDate, getTime} from './dateFunctions.js'
import {StandardModal} from './reactComponents.js';
import {GoogleMapWrapper} from './googleMap.js';


class ObjectDisplayView extends React.Component{

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

export class MessageDisplayView extends React.Component{
  render(){
    let message = this.props.message

    return (
      <ObjectDisplayView
        primaryText={`${getDate(message.date)}`}
        secondaryText={message.message}
        primaryRight={`${getTime(message.date)}`}
        secondaryRight={``}
        iconSrc={urls.HELICOPTER_ICON}
        onClick={this.props.onClick ? this.props.onClick :
          ()=>{this.props.app.setModal(<MessageModalView message={this.props.message} app={this.props.app}/>)}
        }
      />
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

    let title = <div>{message.sender}</div>
    let body = 
      <div>
        <p><strong>{getDate(message.date)} {getTime(message.date)}</strong></p>
        <p>Location: {message.lat},{message.lon}</p>
        <p>{this.state.showOriginal ? message.original : message.message}</p>

        <button className="btn btn-outline-info btn-sm my-1" onClick={()=>this.setState({showOriginal:!this.state.showOriginal})}>
          <em>{this.state.showOriginal ? "Hide" : "Show original message"}</em>
        </button>
        <GoogleMapWrapper id={"messageMap"} points={[{lat:message.lat, lng:message.lon}]}/>

      </div>

    let footer = 
      <div>
        {message.mapshare ? <button className="btn btn-outline-primary"><a href={message.mapshare} target="_blank" >Garmin Mapshare</a></button> : ""}
      </div>

    return <StandardModal title={title} body={body} footer={footer} hideModal={this.props.app.hideModal} />
  }
}





