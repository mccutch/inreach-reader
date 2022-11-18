import React from "react";
import { GoogleMapWrapper } from "../components/google/googleMap";
import {
  parseISODate,
  displayDate,
  displayTime,
} from "../components/dateFunctions";
import { Redirect } from "react-router-dom";
import * as urls from "../urls";
import { apiFetch } from "../helperFunctions";
import { StandardModal } from "../components/reactComponents";

export class TripViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleError = this.handleError.bind(this);
  }

  componentDidMount() {
    let uuid = this.props.uuid;
    console.log(uuid);

    apiFetch({
      url: `${urls.TRIP_READ_ONLY}/${this.props.uuid}/`,
      method: "GET",
      noAuth: true,
      onSuccess: (data) => {
        console.log(data);

        let points = JSON.parse(data.trip.points);
        let paths = JSON.parse(data.trip.paths);

        this.setState({
          user: data.user,
          trip: data.trip,
          showMap: points.length > 0 || paths.length > 0,
        });
      },
      onFailure: (error) => {
        console.log(error);
        this.handleError("Unable to find trip.");
      },
    });
  }

  handleError(message) {
    let title = <div>Error</div>;
    let body = <p>{message}</p>;
    this.props.app.setModal(
      <StandardModal
        title={title}
        body={body}
        hideModal={this.props.app.hideModal}
      />
    );
    console.log("Redirect to home");
    this.setState({ redirect: urls.HOME });
  }

  render() {
    if (this.state.redirect)
      return <Redirect push={true} to={this.state.redirect} />;

    if (!this.state.trip) return <p>Loading...</p>;

    let trip = this.state.trip;
    let departs = parseISODate(trip.departs);
    let returnTime = parseISODate(trip.returns);
    let overdue = trip.overdue ? parseISODate(trip.overdue) : null;
    let paths = JSON.parse(trip.paths);
    let points = JSON.parse(trip.points);

    return (
      <div>
        <div>
          <h4>User: {this.state.user.username}</h4>
          <p>Email: {this.state.user.email}</p>
          <h4>{trip.name}</h4>
          <br />
          <p>
            Departs: {displayDate(departs)} {displayTime(departs)}
          </p>
          <br />
          <p>
            Returns: {displayDate(returnTime)} {displayTime(returnTime)}
          </p>
          <br />
          <p>
            Overdue time:{" "}
            {trip.overdue && `${displayDate(overdue)} ${displayTime(overdue)}`}
          </p>
          <br />
          <p>
            Instructions if overdue:{" "}
            {trip.instructions ? trip.instructions : "Not provided."}
          </p>
          <br />
          <p>Trip description: {trip.description}</p>
          <br />
          {this.state.showMap && (
            <GoogleMapWrapper
              id={"readOnlyMap"}
              editable={false}
              points={points}
              paths={paths}
            />
          )}
        </div>
      </div>
    );
  }
}
