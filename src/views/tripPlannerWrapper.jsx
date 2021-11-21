import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom'
import {StandardModal, WarningModal} from '../components/reactComponents.jsx'
import {apiFetch} from '../helperFunctions.js'
import * as urls from '../urls.js'
import {LoadingScreen} from './loading.jsx'
import * as obj from '../objectDefinitions.js'
import { TripPlanner } from './tripPlanner.jsx';

// TripEdit checks that tripId is valid and current user is the trip owner, then renders a TripPlannerWrapper
class TripEdit extends React.Component{
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
        <TripPlannerWrapper trip={this.state.trip} app={this.props.app} user={this.props.user} />
        :
        <LoadingScreen />
      }
      </div>
    )

  }
}
TripEdit.propTypes = {
  tripId: PropTypes.number,
  app: PropTypes.shape(obj.AppFunctions),
  user: PropTypes.shape(obj.UserData),
}

// Wrapper component handles validation and API calls to database
function TripPlannerWrapper({app, user, trip}){
  const [errorMessage, setErrorMessage] = useState("")
  const [pending, setPending] = useState(false)
  const [dataToSave, setDataToSave] = useState(null)
  const [redirect, setRedirect] = useState(null)

  useEffect(()=>{
    if(dataToSave){validateInputs()}
  }, [dataToSave])

  function validateInputs(){
    setErrorMessage("")
    setPending(true)
    let d = dataToSave
    // ERRORS
    if(!d.name) return returnError("Trip name required.");
    if(d.returnTime < d.departTime) return returnError("Return time must be later than departure.");
    if(d.overdueTime && (d.overdueTime < d.returnTime)) return returnError("Overdue time must be later than return time.")
    if(d.overdueTime&&!d.overdueInstructions) return returnError("Please provide instructions in case you are overdue.")

    // WARNINGS
    let warnings = []
    if(!d.description) warnings.push(
      <p> - No trip description provided.</p>
    );
    if(d.contacts.length===0) warnings.push(
      <p> - No emergency contact provided.</p>
    );
    if(d.overdueTime&&(((d.overdueTime.getTime()-d.returnTime.getTime())/(1000*60*60))<2)) warnings.push(
      <p> - Overdue time is within 2hrs of return. Consider allowing more time before action is required.</p>
    );

    // If no warnings, continue. Else, show modal.
    if(warnings.length===0){
      saveTrip()
    } else {
      app.setModal(
        <WarningModal
          warnings={warnings}
          onContinue={()=>{app.hideModal(); saveTrip()}}
          hideModal={()=>{app.hideModal(); returnError("")}}
        />
      )
    }
  }

  function saveTrip(){
    let newTrip = trip ? false:true
    let d = dataToSave
    let contactIds = []
    for(let i in d.contacts){
      contactIds.push(d.contacts[i].id)
    }

    // Follow format of backend serializer class
    let tripData={
      name: d.name,
      departs: d.departTime.toISOString(),
      returns: d.returnTime.toISOString(),
      description: d.description,
      points: JSON.stringify(d.points),
      paths: JSON.stringify(d.paths),
      contacts: contactIds,
      overdue: d.overdueTime ? d.overdueTime.toISOString() : null,
      instructions: d.overdueTime ? d.overdueInstructions : "",
    }
    console.log("Data is about to be saved: ", tripData)
    console.log(tripData)

    apiFetch({
      url: newTrip ? urls.MY_TRIPS : `${urls.TRIP}/${trip.id}/`,
      method: newTrip ? "POST" : "PATCH",
      data: tripData,
      onSuccess: handleSuccess,
      onFailure: handlePostFailure,
    })
  }

  function handleSuccess(newTrip){
    console.log("TRIP SAVED!")
    console.log(newTrip)
    app.refresh()
    console.log("Redirect to home")
    setRedirect(urls.HOME)
  }

  function handlePostFailure(error){
    console.log(error)
    returnError(`Unable to save ${trip ? "changes":"new trip"}.`)
  }

  function returnError(message){
    setErrorMessage(message)
    setPending(false)
    setDataToSave(null)
    return false
  }

  function confirmDelete(){
    setPending(true)
    app.setModal(
      <WarningModal 
        body={<div>Are you sure you want to delete this trip?</div>} 
        onContinue={()=>{app.hideModal(); deleteTrip()}}
        hideModal={()=>{app.hideModal(); returnError("")}}
      />)
  }

  function deleteTrip(){
    console.log("DELETE")
    apiFetch({
      url: `${urls.TRIP}/${trip.id}/`,
      method: "DELETE",
      onSuccess:()=>{
        app.refresh()
        console.log("Redirect to home")
        setRedirect(urls.HOME)
      },
      onFailure: handlePostFailure,
    })
  }

  // Redirect to home on save or delete
  if(redirect) return <Redirect push={true} to={redirect} />
   
  if(!app.loggedIn){
    return (app.loginPending ?
      <LoadingScreen />
      :
      <Redirect push={true} to={urls.HOME} />
    ) 
  }

  return(
    <TripPlanner
      app={app}
      user={user}
      trip={trip}
      errorMessage={errorMessage}
      deleteTrip={confirmDelete}
      returnDataForValidation={setDataToSave}
      pending={pending}
    />
  )
}
TripPlannerWrapper.propTypes = {
  app: PropTypes.shape(obj.AppFunctions),
  user: PropTypes.shape(obj.UserData),
  trip: PropTypes.shape(obj.Trip),
}


export {
  TripEdit,
  TripPlannerWrapper,
}