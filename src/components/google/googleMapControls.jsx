import React from "react";
import PropTypes from "prop-types";
import * as urls from "../../urls.js";
import {
  LOCKED,
  NEW_PATH,
  EDIT_POINTS,
  TOGGLE_LOCK,
} from "./mapModeDefinitions";

function MapControlButton({ isActive, onClick, icon, size }) {
  let activeStyle = "btn-warning";
  let inactiveStyle = "btn-light";
  return (
    <button
      className={`btn ${isActive ? activeStyle : inactiveStyle} btn-block`}
      onClick={onClick}
    >
      <img alt="" src={icon} width={size ? size : "30"} />
    </button>
  );
}
MapControlButton.propTypes = {
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.string,
  size: PropTypes.number,
};

function MapControls({ mode, changeMode, undo }) {
  try {
    return (
      <div className="form-row p-2">
        <div className="col">
          <div className="row">
            <div className="col">
              <MapControlButton
                isActive={mode === NEW_PATH}
                onClick={() => changeMode(NEW_PATH)}
                icon={urls.ADD_NEW_ICON}
              />
            </div>
            <div className="col">
              <MapControlButton
                isActive={mode === EDIT_POINTS}
                onClick={() => changeMode(EDIT_POINTS)}
                icon={urls.WAYPOINT_ICON}
              />
            </div>
            <div className="col">
              <MapControlButton
                isActive={false}
                onClick={undo}
                icon={urls.UNDO_ICON}
              />
            </div>
            <div className="col">
              <MapControlButton
                isActive={mode === LOCKED}
                onClick={() => changeMode(TOGGLE_LOCK)}
                icon={urls.LOCK_ICON}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.log("MapControls error:", err);
    return <div></div>;
  }
}
MapControls.propTypes = {
  mode: PropTypes.string,
  changeMode: PropTypes.func,
  undo: PropTypes.func,
};

export { MapControls };
