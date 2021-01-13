import React from 'react';
import {Redirect} from 'react-router-dom';
import {GoogleMapWrapper} from './googleMap.js';
import {today, TimeInputButton, parseISODate} from './dateFunctions.js';
import {StandardModal, PendingBtn, WarningModal} from './reactComponents.js';
import {apiFetch} from './helperFunctions.js';
import * as urls from './urls.js';
import * as con from './constants.js';

export class TripEdit extends React.Component{
  constructor(props){
    super(props)
    this.state={
    }
    this.handleError=this.handleError.bind(this)
  }

  componentDidMount(){
    //Check that tripId is valid to edit
    console.log(this.props.tripId)
    apiFetch({
      url:`${urls.TRIP}/${this.props.tripId}/`,
      method:"GET",
      onSuccess:(trip)=>{
        console.log(trip)
        if(trip.user===this.props.user.user.id){
          this.setState({trip:trip})
        }else{
          this.handleError("You are not authorised to edit this trip.")
        }
      },
      onFailure:(error)=>{
        console.log(error)
        this.handleError("Unable to find trip.")
      },
    })
  }

  handleError(message){
    let title=<div>Error</div>
    let body=<p>{message}</p>
    this.props.app.setModal(<StandardModal title={title} body={body} hideModal={this.props.app.hideModal}/>)
    console.log("Redirect to blank planner")
    this.setState({redirect:urls.PLANNER})
  }

  render(){
    if(this.state.redirect) return <Redirect to={this.state.redirect}/>;

    return(
      <div>
      {this.state.trip ?
        <TripPlanner trip={this.state.trip} app={this.props.app} user={this.props.user} />
        :
        <h1>Loading...</h1>
      }
      </div>
    )

  }
}

export class TripPlanner extends React.Component{

  constructor(props){
    super(props)
    let existing = this.props.trip ? this.props.trip : null

    this.state={
      showOverdue: existing&&existing.overdue ? true : false,
      showMap:false,

      name:existing ? existing.name : null,
      depart:existing ? parseISODate(existing.departs) : today({roundToMins:20}),
      return:existing ? parseISODate(existing.returns) : today({addDays:2, setHour:19}),
      overdue:existing&&existing.overdue ? parseISODate(existing.overdue) : null,
      description:existing ? existing.description : "",
      overdueInstructions:existing&&existing.instructions ? existing.instructions : null,
      paths:existing ? JSON.parse(existing.paths) : [],
      points:existing ? JSON.parse(existing.points) : [],
    }

    /*
    try{
      let points = JSON.parse(existing.points)
      if(points.length>0){
        this.state['points']=points
        this.state['showMap']=true
      }
    }catch{
      this.state['points']=[]
      this.state['showMap']=false
    }
    */

    this.validateInputs=this.validateInputs.bind(this)
    this.returnError=this.returnError.bind(this)
    this.handleChange=this.handleChange.bind(this)
    this.saveTrip=this.saveTrip.bind(this)
    this.handleSuccess=this.handleSuccess.bind(this)
    this.handlePostFailure=this.handlePostFailure.bind(this)
    this.confirmDelete=this.confirmDelete.bind(this)
    this.delete=this.delete.bind(this)
  }

  componentDidMount(){
    this.setState({showMap:(this.state.points.length>0||this.state.paths.length>0)})
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

  confirmDelete(){
    this.setState({pending:true})
    this.props.app.setModal(
      <WarningModal 
        body={<div>Are you sure you want to delete this trip?</div>} 
        continue={()=>{this.props.app.hideModal(); this.delete()}}
        hideModal={()=>{this.props.app.hideModal(); this.returnError("")}}
      />)
  }

  delete(){
    console.log("DELETE")
    apiFetch({
      url:`${urls.TRIP}/${this.props.trip.id}/`,
      method:"DELETE",
      onSuccess:()=>{
        this.props.app.refresh()
        console.log("Redirect to home")
        this.setState({redirect:urls.HOME})
      },
      onFailure:this.handlePostFailure,
    })
  }

  validateInputs(){
    console.log(JSON.stringify(this.state.paths))

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
    let newTrip = this.props.trip ? false:true

    let tripData={
      name:this.state.name,
      departs:this.state.depart.toISOString(),
      returns:this.state.return.toISOString(),
      description:this.state.description,
      points:JSON.stringify(this.state.points),
      paths:JSON.stringify(this.state.paths),
    }


    if(this.state.overdue){
      tripData['overdue']=this.state.overdue.toISOString()
      tripData['instructions']=this.state.overdueInstructions
    }

    console.log(tripData)

    apiFetch({
      url:newTrip ? urls.MY_TRIPS : `${urls.TRIP}/${this.props.trip.id}/`,
      method:newTrip ? "POST" : "PATCH",
      data:tripData,
      onSuccess:this.handleSuccess,
      onFailure:this.handlePostFailure,
    })
  }

  handleSuccess(newTrip){
    console.log("TRIP SAVED!")
    console.log(newTrip)
    this.props.app.refresh()
    console.log("Redirect to home")
    this.setState({redirect:urls.HOME})
  }

  handlePostFailure(error){
    console.log(error)
    this.returnError(`Unable to save${this.props.trip ? " changes":""}.`)
  }

  render(){
    if(this.state.redirect) return <Redirect push={true} to={this.state.redirect} />

    let mapCenter = this.props.user.profile.loc_lat ? {lat:parseFloat(this.props.user.profile.loc_lat), lng: parseFloat(this.props.user.profile.loc_lng)} : null

    return(
      <div>
        <div className="form bg-dark text-light p-2">
          <div className="row">
            <div className="col-lg">
              <input name="name" className="form-control my-2" type="text" placeholder="Trip name" defaultValue={this.state.name} onChange={this.handleChange}/>
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
              <textarea name="description" className="form-control my-2" placeholder="Trip description" rows="3" defaultValue={this.state.description} onChange={this.handleChange}/>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {this.state.showOverdue &&
                <div>
                  Overdue instructions
                  <textarea name="overdueInstructions" className="form-control my-2" placeholder={con.OVERDUE_INSTRUCTIONS} rows="3" defaultValue={this.state.overdueInstructions} onChange={this.handleChange}/>
                </div>
              }
            </div>
          </div>
          <div className="row">
            <div className="col">
              {!this.state.showMap && <button className="btn text-left text-light btn-info btn-block my-2" onClick={()=>{this.setState({showMap:true})}}>+ Add a map</button>}
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p className="text-light"><strong>{this.state.errorMessage}</strong></p>
              {this.props.trip &&
                <PendingBtn pending={this.state.pending} disabled={false} className="btn btn-danger m-2" onClick={this.confirmDelete}>
                  Delete
                </PendingBtn>
              }
              <PendingBtn pending={this.state.pending} disabled={false} className="btn btn-success m-2" onClick={this.validateInputs}>
                {this.props.trip ? "Save changes" : "Save trip"}
              </PendingBtn>
            </div>
            
          </div>
          {this.state.showMap ? 
              <GoogleMapWrapper 
                id = {"baseMap"}
                editable={true}
                locationBias={mapCenter}
                points={this.state.points}
                paths={this.state.paths}
                initialMode="editPath"
                searchBox={true}
                returnPoints={(pointList)=>this.setState({points:pointList})}
                returnPaths={(allPaths)=>this.setState({paths:allPaths})}
              />
              : ""
            }
        </div>
      </div>
    )
  }
}