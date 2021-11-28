import React from 'react'
import PropTypes from 'prop-types'
import {Redirect} from 'react-router-dom'
import {StandardModal} from '../components/reactComponents'
import {apiFetch} from '../helperFunctions'
import * as urls from '../urls'
import {LoadingScreen} from './loading'
import * as obj from '../objectDefinitions'
import { TripPlanner } from './tripPlanner'


// TripEditor checks that tripId is valid and current user is the trip owner, then renders a TripPlannerWrapper
class TripEditor extends React.Component{
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
        <LoadingScreen />
      }
      </div>
    )

  }
}
TripEditor.propTypes = {
  tripId: PropTypes.number,
  app: PropTypes.shape(obj.AppFunctions),
  user: PropTypes.shape(obj.UserData),
}

export {
  TripEditor,
}