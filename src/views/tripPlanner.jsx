import React from 'react'
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom'
import {GoogleMapWrapper} from '../components/googleMap.jsx'
import {today, TimeInputButton, parseISODate} from '../components/dateFunctions.jsx'
import {StandardModal, PendingBtn, WarningModal, FormRow} from '../components/reactComponents.jsx'
import {apiFetch, getObject} from '../helperFunctions.js'
import {EditContact, ViewContact} from '../models/contacts.jsx'
import {ContactList} from '../components/objectSummaryLists.jsx'
import * as urls from '../urls.js'
import * as con from '../constants.js'
import {LoadingScreen} from './loading.jsx'
import {getKMLData, parseInReachData} from '../components/inReachKml.jsx'
import * as obj from '../objectDefinitions.js'



export class TripPlanner extends React.Component{
  constructor(props){
    super(props)
    let existing = this.props.trip ? this.props.trip : null
    console.log("existing: ", existing)

    this.state={
      showOverdue: existing&&existing.overdue ? true : false,
      showMap:false,

      name:existing ? existing.name : null,
      departTime:existing ? parseISODate(existing.departs) : today({roundToMins:20}),
      returnTime:existing ? parseISODate(existing.returns) : today({addDays:2, setHour:19}),
      overdueTime:existing&&existing.overdue ? parseISODate(existing.overdue) : null,
      description:existing ? existing.description : "",
      overdueInstructions:existing&&existing.instructions ? existing.instructions : null,
      paths:existing ? JSON.parse(existing.paths) : [],
      points:existing ? JSON.parse(existing.points) : [],
      contacts:[],
    }

    this.gMap = React.createRef()
    this.handleChange=this.handleChange.bind(this)
    this.addEmergencyContact=this.addEmergencyContact.bind(this)
    this.selectEmergencyContact=this.selectEmergencyContact.bind(this)
    this.fetchInReachData=this.fetchInReachData.bind(this)
    this.returnInputsToWrapper=this.returnInputsToWrapper.bind(this)
  }

  componentDidMount(){
    if(this.props.trip && this.props.trip.contacts.length>0){
      let contacts = this.props.trip.contacts
      let contactList=[]
      for(let i in contacts){
        let contactData = getObject({objectList:this.props.user.contacts, key:"id", keyValue:contacts[i]})
        if(contactData) contactList.push(contactData);
      }
      this.setState({contacts:contactList})
    }

    this.setState({
      showMap:(this.state.points.length>0||this.state.paths.length>0),
    })

    this.fetchInReachData()
  }

  componentDidUpdate(prevProps){
    //Update contact details after editing
    if(prevProps.user.contacts!==this.props.user.contacts){
      let updatedList=[]
      for(let i in this.state.contacts){
        let contact = getObject({objectList:this.props.user.contacts, key:"id", keyValue:this.state.contacts[i].id})
        if(contact) updatedList.push(contact)
      }
      this.setState({contacts:updatedList})
    }
  }

  fetchInReachData(){
    if(this.props.user.profile && this.props.user.profile.mapshare_ID){
      getKMLData({
        mapshareID:this.props.user.profile.mapshare_ID, 
        startDate:this.state.departTime, 
        endDate:this.state.returnTime, 
        onSuccess:(json)=>(this.setState({inReachData:parseInReachData(json)})), 
        onFailure:()=>(console.log("No inreach data loaded"))
      })
    }
  }

  handleChange(event){
    this.setState({[event.target.name]:event.target.value})
  }

  selectEmergencyContact(){
    let title = <div>Add Emergency Contact</div>
    let body = 
    <div>
      {this.props.user.contacts.length>0 ?
        <ContactList 
          contacts={this.props.user.contacts} 
          app={this.props.app} 
          actions={[
            {label:"Use contact", action:(contact)=>{this.addEmergencyContact(contact); this.props.app.hideModal()}},
          ]}
        />
        :
        <p>You have no emergency contacts saved to your profile.</p>
      }
      <button 
        className="btn text-left text-light btn-info btn-block my-2" 
        onClick={()=>{
          this.props.app.setModal(
            <EditContact 
              user={this.props.user} 
              app={this.props.app}
              onSuccess={(contact)=>{this.addEmergencyContact(contact)}}
            />
          )
        }}
        >+ New Contact
      </button>
    </div>
    
    this.props.app.setModal(<StandardModal title={title} body={body} hideModal={this.props.app.hideModal}/>)
  }

  addEmergencyContact(contact, mode="add"){
    //Add or remove a contact from the current state
    console.log("Adding contact", contact)
    let existingContacts = this.state.contacts
    let updatedContacts = []
    for(let i in existingContacts){
      if(contact===existingContacts[i]){
        if(mode==="add"){
          return
        }else{
          continue
        }
      }  
      updatedContacts.push(existingContacts[i])
    }
    if(mode==="add"){updatedContacts.push(contact)}
    this.setState({contacts:updatedContacts})
  }

  returnInputsToWrapper(){
    let mapData = this.state.showMap ? this.gMap.current.returnMapData() : {paths:[],points:[]}
    this.props.returnDataForValidation({
      name: this.state.name,
      departTime: this.state.departTime,
      returnTime: this.state.returnTime,
      overdueTime: this.state.overdueTime,
      description: this.state.description,
      overdueInstructions: this.state.overdueInstructions,
      paths: mapData.paths,
      points: mapData.points,
      contacts: this.state.contacts,
    })
  }

  render(){
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
                value={this.state.departTime}
                returnDateTime={(dt)=>this.setState({departTime:dt},this.fetchInReachData)}
                className="btn-info btn-block my-2"
                app={this.props.app}
              />
            </div>
            <div className="col-lg">
              <TimeInputButton
                label={"Return"}
                value={this.state.returnTime}
                returnDateTime={(dt)=>this.setState({returnTime:dt},this.fetchInReachData)}
                className="btn-info btn-block my-2"
                app={this.props.app}
              />
            </div>
            <div className="col-lg">
              {this.state.showOverdue ?
                <TimeInputButton
                  label={"Overdue"}
                  value={this.state.overdueTime}
                  returnDateTime={(dt)=>this.setState({overdueTime:dt})}
                  className="btn-info btn-block my-2"
                  app={this.props.app}
                />
                :
                <button 
                  className="btn text-left text-light btn-info btn-block my-2"
                  onClick={()=>{
                    let overdueTime = new Date(this.state.returnTime.getTime())
                    overdueTime.setHours(overdueTime.getHours()+4)
                    this.setState({
                      showOverdue:true,
                      overdueTime:overdueTime
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
              Emergency Contacts
              {this.state.contacts.length>0 &&
                <div className="bg-light">
                  <ContactList 
                    contacts={this.state.contacts} 
                    app={this.props.app} 
                    actions={[
                      {label:"View", action:(contact)=>{this.props.app.setModal(<ViewContact contact={contact} user={this.props.user} app={this.props.app}/>)}},
                      {label:"Edit", action:(contact)=>{this.props.app.setModal(<EditContact contact={contact} user={this.props.user} app={this.props.app}/>)}},
                      {label:"Remove", action:(contact)=>{this.addEmergencyContact(contact, "remove")}}
                    ]}
                  />
                </div>
              }
              <button className="btn text-left text-light btn-info btn-block my-2" onClick={this.selectEmergencyContact}>+ Add Emergency Contact</button>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {!this.state.showMap && <button className="btn text-left text-light btn-info btn-block my-2" onClick={()=>{this.setState({showMap:true})}}>+ Add a map</button>}
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p className="text-warning"><strong>{this.props.errorMessage}</strong></p>
              {this.props.trip &&
                <PendingBtn pending={this.state.pending} disabled={false} className="btn btn-danger m-2" onClick={this.props.deleteTrip}>
                  Delete
                </PendingBtn>
              }
              <PendingBtn 
                pending={this.state.pending} disabled={false} className="btn btn-success m-2" 
                onClick={this.returnInputsToWrapper}
                >
                {this.props.trip ? "Save changes" : "Save trip"}
              </PendingBtn>
            </div>
          </div>
          {this.state.showMap ? 
            <GoogleMapWrapper
              ref = {this.gMap} 
              id = {con.GOOGLE_MAP_ID}
              editable={true}
              locationBias={mapCenter}
              points={this.state.inReachData ? this.state.points.concat(this.state.inReachData.points) : this.state.points}
              paths={this.state.inReachData ? this.state.paths.concat(this.state.inReachData.paths) : this.state.paths}
              initialMode="editPoints"
              searchBox={true}
            />
            : ""
          }
        </div>
      </div>
    )
  }
}
TripPlanner.propTypes = {
  app: PropTypes.shape(obj.AppFunctions),
  user: PropTypes.shape(obj.UserData),
  trip: PropTypes.shape(obj.Trip),
  errorMessage: PropTypes.string,
  deleteTrip: PropTypes.func,
  returnDataForValidation: PropTypes.func,
  pending: PropTypes.bool,
}












