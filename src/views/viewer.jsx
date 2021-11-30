import React from "react";
import { TripList } from "../components/objectSummaryLists.jsx";
import { Redirect } from "react-router-dom";
import * as urls from "../urls.js";
import { apiFetch } from "../helperFunctions.js";
import { StandardModal } from "../components/reactComponents.jsx";

export class ViewerAuthenticator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let title = <div>{this.props.username} - Restricted view</div>;
    let body = (
      <form>
        <p>
          <strong>{this.props.errorMessage}</strong>
        </p>
        <input id="phrase" type="text" className="form-control my-2" />
        <button
          className="btn btn-outline-primary my-2"
          onClick={(e) => {
            e.preventDefault();
            let phrase = document.getElementById("phrase").value;
            console.log(phrase);
            this.props.viewer.setPhrase(phrase, this.props.onSuccess);
            this.props.app.hideModal();
          }}
        >
          Submit
        </button>
      </form>
    );

    return (
      <StandardModal
        title={title}
        body={body}
        hideModal={this.props.app.hideModal}
      />
    );
  }
}

export class UserSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.findUser = this.findUser.bind(this);
  }

  findUser(searchTerm) {
    this.setState({ errorMessage: "" });
    apiFetch({
      url: `${urls.USER_READ_ONLY}/${searchTerm}/`,
      method: "GET",
      noAuth: true,
      onSuccess: () => {
        this.setState({ redirect: `${urls.VIEWER}/${searchTerm}` });
      },
      onFailure: (message) => {
        console.log(message);
        this.setState({
          errorMessage: "Username not found. Username is case sensitive.",
        });
      },
    });
  }

  render() {
    if (this.state.redirect)
      return <Redirect push={true} to={this.state.redirect} />;

    return (
      <form>
        <p>{this.state.errorMessage}</p>
        <input className="form-control" id="search" />
        <button
          className="btn btn-success"
          onClick={(e) => {
            e.preventDefault();
            this.findUser(document.getElementById("search").value);
          }}
        >
          Search
        </button>
      </form>
    );
  }
}

export class UserViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.fetchUserData = this.fetchUserData.bind(this);
  }

  componentDidMount() {
    this.fetchUserData();
  }

  authenticateViewer(message) {
    this.props.app.setModal(
      <ViewerAuthenticator
        app={this.props.app}
        viewer={this.props.viewer}
        username={this.props.userParam}
        onSuccess={this.fetchUserData}
        errorMessage={message}
      />
    );
  }

  fetchUserData() {
    this.setState({ notFound: false });
    apiFetch({
      url: `${urls.USER_READ_ONLY}/${this.props.userParam}/`,
      method: "POST",
      noAuth: true,
      data: { pass_phrase: this.props.viewer.phrase },
      onSuccess: (json) => {
        this.setState({
          user: json.user[0],
          trips: json.trips,
        });
      },
      onFailure: (err) => {
        console.log(err);
        if (err === "404") {
          this.props.app.setModal(
            <StandardModal
              title={<div>Error</div>}
              body={
                <p>{`Unable to find user account ${this.props.userParam}.`}</p>
              }
              hideModal={this.props.app.hideModal}
            />
          );
          console.log("No user account found. Send back to search.");
          this.setState({ redirect: urls.VIEWER });
        } else if (err === "403") {
          console.log("Bad pass phrase. Reauthentication required.");
          this.props.viewer.setPhrase(null);
          this.authenticateViewer("Incorrect. Please try again.");
        } else if (err === "406") {
          console.log("Pass phrase required.");
          this.authenticateViewer(
            "Please enter pass phrase to view user profile."
          );
        }
      },
    });
  }

  render() {
    if (this.state.redirect)
      return <Redirect push={true} to={this.state.redirect} />;

    return (
      <div>
        <TripList
          viewOnly={true}
          trips={this.state.trips}
          app={this.props.app}
          actions={[
            {
              label: "View",
              action: (trip) =>
                this.setState({ redirect: `${urls.VIEW_TRIP}/${trip.uuid}` }),
            },
          ]}
        />
      </div>
    );
  }
}
