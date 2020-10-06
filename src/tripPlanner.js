import React from 'react';
import {GoogleMapWrapper} from './googleMap.js';
import {today, timeNow, formatDate, formatTime, displayDate, displayTime} from './dateFunctions.js';
import {StandardModal} from './reactComponents.js';


class TimeInputModal extends React.Component{
  constructor(props){
    super(props)
    this.state={}
    this.returnDateTime=this.returnDateTime.bind(this)
  }
  returnDateTime(){

  }

  render(){
    console.log(this.props)
    let title=<div>{this.props.title}</div>
    let body = 
      <div className="form-row">
        <div className="col-6">
          <input className="form-control my-2" type="date" defaultValue={this.props.defaultDate}/>
        </div>
        <div className="col-6">
          <input className="form-control my-2" type="time" defaultValue={this.props.defaultTime} />
        </div>
      </div>

    let footer = <button className="btn btn-block btn-success" onClick={this.returnDateTime}>Continue</button>  
    return <StandardModal title={title} body={body} footer={footer} hideModal={this.props.app.hideModal}/>
  }
}


export class TripPlanner extends React.Component{

  constructor(props){
    super(props)
    this.state={
      showMap:true,
      showOverdue:true,

      depart:today(),
      return:today(2),
      overdue:today(3),
    }
    this.editDateTime=this.editDateTime.bind(this)
  }

  editDateTime(event){
    let name=event.target.name
    let title = name==="depart" ? "Departure time"
              : name==="return" ? "Return time"
              : name==="overdue" ? "Overdue time"
              : ""

    this.props.app.setModal(
      <TimeInputModal 
        title={title}
        defaultDate={formatDate(this.state[name])} 
        defaultTime={formatTime(this.state[name])}
        returnTime={(dateTime)=>this.setState({[name]:dateTime})}
        app={this.props.app} />
    )
  }


  render(){
    return(
      <div>
        <div className="form bg-dark p-2">
          <div className="row">
            <div className="col-lg">
              <input className="form-control my-2" type="text" placeholder="Trip name"/>
            </div>
          </div>
            <div className="col-md">
              <button className="btn btn-info btn-block my-2" name="depart" onClick={this.editDateTime} >{`Depart: ${displayDate(this.state.depart), displayTime(this.state.depart)}`}</button>
            </div>
            <div className="col-md">
              <button className="btn btn-info btn-block my-2" name="depart"onClick={this.editDateTime} >{`Return: ${displayDate(this.state.return), displayTime(this.state.return)}`}</button>
            </div>
            <div className="col-md">
              <button className="btn btn-info btn-block my-2" name="overdue" onClick={this.editDateTime} >{`Overdue: ${displayDate(this.state.depart), displayTime(this.state.depart)}`}</button>
            </div>

          <div className="row">
            <div className="col">
              <textArea className="form-control my-2" placeholder="Trip description" rows="3"/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            {this.state.showMap ? 
              <GoogleMapWrapper 
                id = {"baseMap"}
                editable={true}
              />
              : ""
            }
          </div>

        </div>
      </div>
    )
  }
}