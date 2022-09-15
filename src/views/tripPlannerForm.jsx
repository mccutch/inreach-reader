import React from "react";
import PropTypes from "prop-types";
import { GoogleMapWrapper } from "../components/google/googleMap";
import {
  today,
  parseISODate,
  offsetTimeByHrs,
} from "../components/dateFunctions";
import { TimeInputButton } from "../components/tripPlannerFormElements";
import { PendingBtn } from "../components/reactComponents";
import { getObjectById } from "../helperFunctions";
import {
  EditContact,
  ViewContact,
  AddEmergencyContactButton,
} from "../models/contacts";
import { ContactList } from "../components/objectSummaryLists";
import * as con from "../constants";
import { getKMLData, GarminStatusIndicator } from "../components/inReachKml";
import * as obj from "../objectDefinitions";
import { EDIT_POINTS } from "../components/google/mapModeDefinitions";
import { importGoogleLibraries } from "../components/google/googleFunctions";
import { hasPaths, hasPoints } from "../components/google/googleMapFunctions";

export class TripPlannerForm extends React.Component {
  constructor(props) {
    super(props);

    const existingTrip = this.props.trip || null;

    this.state = {
      showMap: false,
      ...generateInitialFormValues(existingTrip, this.props.user),
    };

    this.gMap = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.addEmergencyContact = this.addEmergencyContact.bind(this);
    this.removeEmergencyContact = this.removeEmergencyContact.bind(this);
    this.fetchInReachData = this.fetchInReachData.bind(this);
    this.returnInputsToWrapper = this.returnInputsToWrapper.bind(this);
    this.loadGoogleServices = this.loadGoogleServices.bind(this)
    this.onGoogleServicesLoaded = this.onGoogleServicesLoaded.bind(this)
  }

  componentDidMount() {
    this.fetchInReachData();
    if(hasPaths(this.state)||hasPoints(this.state)){
      this.loadGoogleServices()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user.contacts !== this.props.user.contacts) {
      this.setState({
        contacts: getContactDetailsFromProfile(
          this.props.trip.contacts,
          this.props.user
        ),
      });
    }
  }

  fetchInReachData() {
    if (this.props.user.profile && this.props.user.profile.mapshare_ID) {
      getKMLData({
        mapshareID: this.props.user.profile.mapshare_ID,
        startDate: this.state.departTime,
        endDate: this.state.returnTime,
        onSuccess: (parsedData) =>
          this.setState({ inReachData: parsedData, garminStatus: con.GARMIN_OK }),
        onFailure: (err) => {
          console.warn("Garmin error: ", err)
          this.setState({garminStatus: con.GARMIN_NOT_OK})
        },
      });
    } else if (this.props.user.profile && !this.props.user.profile.mapshare_ID) {
      this.setState({garminStatus: con.GARMIN_NOT_CONNECTED_TO_PROFILE})
    } else {
      this.setState({garminStatus: con.GARMIN_NOT_OK})
    }
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  removeEmergencyContact(contactToRemove) {
    this.setState({
      contacts: this.state.contacts.filter(
        (contact) => contact !== contactToRemove
      ),
    });
  }

  addEmergencyContact(contactToAdd) {
    if (this.state.contacts.find((contact) => contact === contactToAdd)) {
      return;
    }
    this.setState({ contacts: [...this.state.contacts, contactToAdd] });
  }

  loadGoogleServices(){
    console.log("Attempting to load gMaps")
    window.onGoogleServicesLoaded = this.onGoogleServicesLoaded
    importGoogleLibraries("onGoogleServicesLoaded")
    
  }

  onGoogleServicesLoaded(){
    this.setState({showMap: true})
  }

  returnInputsToWrapper() {
    let mapData = this.state.showMap
      ? this.gMap.current.returnMapData()
      : { paths: [], points: [] };
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
    });
  }

  render() {
    let mapCenter = this.props.user.profile.loc_lat
      ? {
          lat: parseFloat(this.props.user.profile.loc_lat),
          lng: parseFloat(this.props.user.profile.loc_lng),
        }
      : null;

    return (
      <div>
        <div className="form bg-dark text-light p-2">
          <div className="row">
            <div className="col-lg">
              <input
                name="name"
                className="form-control my-2"
                type="text"
                placeholder="Trip name"
                defaultValue={this.state.name}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <TimeInputButton
                value={this.state.departTime}
                returnDateTime={(dt) =>
                  this.setState({ departTime: dt }, this.fetchInReachData)
                }
                app={this.props.app}
              >
                Depart
              </TimeInputButton>
            </div>
            <div className="col-lg">
              <TimeInputButton
                value={this.state.returnTime}
                returnDateTime={(dt) =>
                  this.setState({ returnTime: dt }, this.fetchInReachData)
                }
                app={this.props.app}
              >
                Return
              </TimeInputButton>
            </div>
            <div className="col-lg">
              {this.state.showOverdue ? (
                <TimeInputButton
                  value={this.state.overdueTime}
                  returnDateTime={(dt) => this.setState({ overdueTime: dt })}
                  app={this.props.app}
                >
                  Overdue
                </TimeInputButton>
              ) : (
                <button
                  className="btn text-left text-light btn-info btn-block my-2"
                  onClick={() => {
                    this.setState({
                      showOverdue: true,
                      overdueTime: offsetTimeByHrs(this.state.returnTime, 4),
                    });
                  }}
                >
                  + Add an overdue time
                </button>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col">
              Trip description
              <textarea
                name="description"
                className="form-control my-2"
                placeholder="Trip description"
                rows="3"
                defaultValue={this.state.description}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              {this.state.showOverdue && (
                <div>
                  Overdue instructions
                  <textarea
                    name="overdueInstructions"
                    className="form-control my-2"
                    placeholder={con.OVERDUE_INSTRUCTIONS}
                    rows="3"
                    defaultValue={this.state.overdueInstructions}
                    onChange={this.handleChange}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col">
              Emergency Contacts
              {this.state.contacts.length > 0 && (
                <div className="bg-light">
                  <ContactList
                    contacts={this.state.contacts}
                    app={this.props.app}
                    actions={[
                      {
                        label: "View",
                        action: (contact) => {
                          this.props.app.setModal(
                            <ViewContact
                              contact={contact}
                              user={this.props.user}
                              app={this.props.app}
                            />
                          );
                        },
                      },
                      {
                        label: "Edit",
                        action: (contact) => {
                          this.props.app.setModal(
                            <EditContact
                              contact={contact}
                              user={this.props.user}
                              app={this.props.app}
                            />
                          );
                        },
                      },
                      {
                        label: "Remove",
                        action: (contact) => {
                          this.removeEmergencyContact(contact);
                        },
                      },
                    ]}
                  />
                </div>
              )}
              <AddEmergencyContactButton
                app={this.props.app}
                user={this.props.user}
                onSelect={this.addEmergencyContact}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              {!this.state.showMap && (
                <button
                  className="btn text-left text-light btn-info btn-block my-2"
                  onClick={() => {
                    this.loadGoogleServices();
                  }}
                >
                  + Add a map
                </button>
              )}
            </div>
          </div>
          <div>
            <GarminStatusIndicator status={this.state.garminStatus}/>
          </div>
          <div className="row">
            <div className="col">
              <p className="text-warning">
                <strong>{this.props.errorMessage}</strong>
              </p>
              {this.props.trip && (
                <PendingBtn
                  pending={this.state.pending}
                  disabled={false}
                  className="btn btn-danger m-2"
                  onClick={this.props.deleteTrip}
                >
                  Delete
                </PendingBtn>
              )}
              <PendingBtn
                pending={this.state.pending}
                disabled={false}
                className="btn btn-success m-2"
                onClick={this.returnInputsToWrapper}
              >
                {this.props.trip ? "Save changes" : "Save trip"}
              </PendingBtn>
            </div>
          </div>
          {this.state.showMap && (
            <GoogleMapWrapper
              ref={this.gMap}
              id={con.GOOGLE_MAP_ID}
              editable={true}
              locationBias={mapCenter}
              points={
                this.state.inReachData
                  ? this.state.points.concat(this.state.inReachData.points)
                  : this.state.points
              }
              paths={
                this.state.inReachData
                  ? this.state.paths.concat(this.state.inReachData.paths)
                  : this.state.paths
              }
              initialMode={EDIT_POINTS}
              searchBox={true}
            />
          )}
        </div>
      </div>
    );
  }
}
TripPlannerForm.propTypes = {
  app: PropTypes.shape(obj.AppFunctions),
  user: PropTypes.shape(obj.UserData),
  trip: PropTypes.shape(obj.Trip),
  errorMessage: PropTypes.string,
  deleteTrip: PropTypes.func,
  returnDataForValidation: PropTypes.func,
  pending: PropTypes.bool,
};

function getContactDetailsFromProfile(contactIds, user) {
  return contactIds.map((contactId) => getObjectById(user.contacts, contactId));
}

// Populate state using an existing trip, or set all to defaults
function generateInitialFormValues(trip, user) {
  const doesTripAlreadyExist = !!trip;

  if (doesTripAlreadyExist) {
    const points = JSON.parse(trip.points);
    const paths = JSON.parse(trip.paths);
    return {
      name: trip.name,
      departTime: parseISODate(trip.departs),
      returnTime: parseISODate(trip.returns),
      overdueTime: trip.overdue ? parseISODate(trip.overdue) : null,
      description: trip.description,
      overdueInstructions: trip.instructions,
      paths: paths,
      points: points,
      showOverdue: !!trip.overdue,
      contacts: getContactDetailsFromProfile(trip.contacts, user),
      garminStatus: con.GARMIN_STATUS_UNKNOWN,
    };
  } else {
    return {
      name: null,
      departTime: today({ roundToMins: 20 }),
      returnTime: today({ addDays: 2, setHour: 19 }),
      overdueTime: null,
      description: "",
      overdueInstructions: null,
      paths: [],
      points: [],
      showOverdue: false,
      contacts: [],
      garminStatus: con.GARMIN_STATUS_UNKNOWN,
    };
  }
}
