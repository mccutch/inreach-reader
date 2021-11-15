import PropTypes from 'prop-types';



const Position = {
    lat: PropTypes.number,
    lng: PropTypes.number,
}

const Point = {
    position: PropTypes.shape(Position),
    label: PropTypes.string,
    description: PropTypes.string,
}

const Path = {
    path: PropTypes.arrayOf(PropTypes.shape(Position)),
    name: PropTypes.string,
    colour: PropTypes.string,
}

const Trip = {

}

export {
    Position,
    Point,
    Path,
    Trip,
}