import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom'
import {WarningModal} from '../components/reactComponents'
import {apiFetch} from '../helperFunctions'
import * as urls from '../urls'
import {LoadingScreen} from './loading'
import * as obj from '../objectDefinitions'
import { TripPlannerForm } from './tripPlannerForm';




// TripPlanner component handles validation and API calls to database
function TripPlanner({app, user, trip}){
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
    const d = dataToSave
    // ERRORS
    if(!d.name) return returnError("Trip name required.");
    if(d.returnTime < d.departTime) return returnError("Return time must be later than departure.");
    if(d.overdueTime && (d.overdueTime < d.returnTime)) return returnError("Overdue time must be later than return time.")
    if(d.overdueTime&&!d.overdueInstructions) return returnError("Please provide instructions in case you are overdue.")

    // WARNINGS
    let warnings = []
    warnings.push(isDescriptionProvided(d))
    warnings.push(isContactProvided(d))
    warnings.push(isOverdueTimeValid(d))
    warnings = warnings.filter(text => typeof text === "string")

    // If no warnings, continue. Else, show modal.
    if(warnings.length===0){
      saveTrip()
    } else {
      console.log(warnings)
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
    const isNewTrip = !trip
    apiFetch({
      url: isNewTrip ? urls.MY_TRIPS : `${urls.TRIP}/${trip.id}/`,
      method: isNewTrip ? "POST" : "PATCH",
      data: formatTripData(dataToSave),
      onSuccess: handleSuccess,
      onFailure: handlePostFailure,
    })
  }

  function handleSuccess(newTrip){
    app.refresh()
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
    <TripPlannerForm
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
TripPlanner.propTypes = {
  app: PropTypes.shape(obj.AppFunctions),
  user: PropTypes.shape(obj.UserData),
  trip: PropTypes.shape(obj.Trip),
}

// Format data to match backend db structure
function formatTripData(data){
  return {
    name: data.name,
    departs: data.departTime.toISOString(),
    returns: data.returnTime.toISOString(),
    description: data.description,
    points: JSON.stringify(data.points),
    paths: JSON.stringify(data.paths),
    contacts: data.contacts.map(contact => contact.id),
    overdue: data.overdueTime ? data.overdueTime.toISOString() : null,
    instructions: data.overdueTime ? data.overdueInstructions : "",
  }
}

function isDescriptionProvided(d){
  if(!d.description){return "No trip description provided."}
}

function isContactProvided(d){
  if(d.contacts.length===0){return "No emergency contact provided."}
}

function isOverdueTimeValid(d){
  if(d.overdueTime&&(((d.overdueTime.getTime()-d.returnTime.getTime())/(1000*60*60))<2)){
    return "Overdue time is within 2hrs of return. Consider allowing more time before action is required."
  }
}

export {
  TripPlanner,
}