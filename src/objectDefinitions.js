import PropTypes from 'prop-types';
let pt = PropTypes

const Position = {
    lat: pt.number,
    lng: pt.number,
}

const Point = {
    position: pt.shape(Position),
    label: pt.string,
    description: pt.string,
}

const Path = {
    path: pt.arrayOf(pt.shape(Position)),
    name: pt.string,
    colour: pt.string,
}

const Trip = {

}

const AppFunctions = {
    refresh: pt.func,
    hideModal: pt.func,
    setModal: pt.func,
    loggedIn: pt.bool,
    loginPending: pt.bool,
    serverError: pt.bool,
}

const User = {

}

const Profile = {

}

const Message = {

}

const Contact = {

}

const UserData = {
    user: User,
    profile: Profile,
    messages: pt.arrayOf(pt.shape(Message)),
    trips: pt.arrayOf(pt.shape(Trip)),
    contacts: pt.arrayOf(pt.shape(Contact)),
}

const TrackingPoint = {
    description: pt.string,
    position: pt.shape(Position),
    label: pt.string,
}

const TrackingPath = {
    name: pt.string,
    colour: pt.string,
    path: pt.arrayOf(pt.shape(Position)),
}

const TrackingData = {
    paths: pt.arrayOf(pt.shape(TrackingPath)),
    points: pt.arrayOf(pt.shape(TrackingPoint)),
}

export {
    Position,
    Point,
    Path,
    Trip,
    AppFunctions,
    User,
    Message,
    Contact,
    UserData,
    TrackingPoint,
    TrackingPath,
    TrackingData,
}