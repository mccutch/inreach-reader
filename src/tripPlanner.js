import React from 'react';
import {Redirect} from 'react-router-dom';
import {GoogleMapWrapper} from './googleMap.js';
import {today, TimeInputButton} from './dateFunctions.js';
import {StandardModal, PendingBtn, WarningModal} from './reactComponents.js';
import {apiFetch} from './helperFunctions.js';
import * as urls from './urls.js';
import * as con from './constants.js';

export class TripPlanner extends React.Component{

  constructor(props){
    super(props)
    this.state={
      showMap:true,
      showOverdue:false,

      depart:today({roundToMins:20}),
      return:today({addDays:2, setHour:19}),

      points:[],
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
    return false
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  validateInputs(){
    this.setState({errorMessage:"", pending:true,})
    
    // ERRORS
    if(!this.state.name) return this.returnError("Trip name required.");

    if(this.state.return < this.state.depart) return this.returnError("Return time must be later than departure.");

    if(this.state.overdue && (this.state.overdue < this.state.return)) return this.returnError("Overdue time must be later than return time.")

    // WARNINGS
    let warnings = []
    if(!this.state.description) warnings.push(
      <p> - No trip description provided.</p>
    );
      
    if(this.state.overdue&&(((this.state.overdue.getTime()-this.state.return.getTime())/(1000*60*60))<2)) warnings.push(
      <p> - Overdue time is within 2hrs of return. Consider allowing more time before action is required.</p>
    );

    if(this.state.overdue&&!this.state.overdueInstructions) warnings.push(
      <p> - No overdue instructions provided.</p>
    );

    // If no warnings, continue. Else, show modal.
    if(warnings.length===0){
      this.saveTrip()
    } else {
      this.props.app.setModal(
        <WarningModal
          warnings={warnings}
          continue={()=>{this.props.app.hideModal(); this.saveTrip()}}
          hideModal={()=>{this.props.app.hideModal(); this.returnError("")}}
        />
      )
    }
    
  }

  saveTrip(){
    let tripData={
      name:this.state.name,
      departs:this.state.depart.toISOString(),
      returns:this.state.return.toISOString(),
      description:this.state.description,
    }

    if(this.state.overdue){
      tripData['overdue']=this.state.overdue.toISOString()
      tripData['instructions']=this.state.overdueInstructions
    }

    console.log(tripData)

    apiFetch({
      url:urls.MY_TRIPS,
      method:"POST",
      data:tripData,
      onSuccess:this.handleSuccess,
      onFailure:this.handlePostFailure,
    })
  }

  handleSuccess(newTrip){
    console.log("TRIP SAVED!")
    console.log(newTrip)
    this.setState({redirect:urls.HOME})
  }

  handlePostFailure(error){
    console.log(error)
    this.returnError("Unable to save.")
  }

  render(){
    if(this.state.redirect) return <Redirect to={this.state.redirect} />
    return(
      <div>
        <div className="form bg-dark text-light p-2">
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
              Trip description
              <textarea name="description" className="form-control my-2" placeholder="Trip description" rows="3" onChange={this.handleChange}/>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {this.state.showOverdue &&
                <div>
                  Overdue instructions
                  <textarea name="overdueInstructions" className="form-control my-2" placeholder={con.OVERDUE_INSTRUCTIONS} rows="3" onChange={this.handleChange}/>
                </div>
              }
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p className="text-light"><strong>{this.state.errorMessage}</strong></p>
              <PendingBtn pending={this.state.pending} disabled={false} className="btn btn-success my-2" onClick={this.validateInputs}>Save trip</PendingBtn>
            </div>
            
          </div>
          {this.state.showMap ? 
              <GoogleMapWrapper 
                id = {"baseMap"}
                editable={true}
                initialMode="editPoints"
                searchBox={true}
                returnPoints={(pointList)=>this.setState({points:pointList})}
              />
              : ""
            }
        </div>
      </div>
    )
  }
}