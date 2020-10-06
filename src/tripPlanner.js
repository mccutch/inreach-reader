import React from 'react';
import {GoogleMapWrapper} from './googleMap.js';
import {today, timeNow, formatDate, formatTime, displayDate, displayTime, TimeInputButton} from './dateFunctions.js';
import {StandardModal, PendingBtn} from './reactComponents.js';
import {apiFetch} from './helperFunctions.js';
import * as urls from './urls.js';

export class TripPlanner extends React.Component{

  constructor(props){
    super(props)
    this.state={
      showMap:true,
      showOverdue:false,

      depart:today({roundToMins:20}),
      return:today({addDays:2, setHour:19}),
    }
    this.validateInputs=this.validateInputs.bind(this)
    this.returnError=this.returnError.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.saveTrip=this.saveTrip.bind(this)
    this.handleSuccess=this.handleSuccess.bind(this)
    this.handlePostFailure=this.handlePostFailure.bind(this)
  }

  returnError(message){
    this.setState({
      errorMessage:message,
      pending:false,
    })
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  validateInputs(){
    this.setState({errorMessage:"", pending:true,})

    if(!this.state.name) this.returnError("Trip name required.");

    if(!this.state.description) this.returnError("Trip description required.");

    this.saveTrip()
  }

  saveTrip(){
    let tripData={
      name:this.state.name,
      depart:this.state.depart.toISOString(),
      return:this.state.return.toISOString(),
      description:this.state.description,
    }

    if(this.state.overdue) tripData['overdue']=this.state.overdue.toISOString();

    console.log(tripData)
    return

    apiFetch({
      url:urls.MY_TRIPS,
      method:"POST",
      data:tripData,
      onSuccess:this.handleSuccess,
      onFailure:this.handlePostFailure,
    })
  }

  handleSuccess(){

  }

  handlePostFailure(){

  }

  render(){
    return(
      <div>
        <div className="form bg-dark p-2">
          <div className="row">
            <div className="col-lg">
              <input name="name" className="form-control my-2" type="text" placeholder="Trip name" onChange={this.handleChange}/>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <TimeInputButton
                label={"Depart"}
                value={this.state.depart}
                returnDateTime={(dt)=>this.setState({depart:dt})}
                className="btn-info btn-block my-2"
                app={this.props.app}
              />
            </div>
            <div className="col-lg">
              <TimeInputButton
                label={"Return"}
                value={this.state.return}
                returnDateTime={(dt)=>this.setState({return:dt})}
                className="btn-info btn-block my-2"
                app={this.props.app}
              />
            </div>
            <div className="col-lg">
              {this.state.showOverdue ?
                <TimeInputButton
                  label={"Overdue"}
                  value={this.state.overdue}
                  returnDateTime={(dt)=>this.setState({overdue:dt})}
                  className="btn-info btn-block my-2"
                  app={this.props.app}
                />
                :
                <button 
                  className="btn text-left text-light btn-info btn-block my-2"
                  onClick={()=>{
                    let overdue = new Date(this.state.return.getTime())
                    overdue.setHours(overdue.getHours()+4)
                    this.setState({
                      showOverdue:true,
                      overdue:overdue
                    })
                  }}
                >+ Add an overdue time</button>
              }
            </div>
          </div>
          <div className="row">
            <div className="col">
              <textArea name="description" className="form-control my-2" placeholder="Trip description" rows="3" onChange={this.handleChange}/>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <PendingBtn pending={this.state.pending} disabled={false} className="btn btn-success my-2" onClick={this.validateInputs}>Save trip</PendingBtn>
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