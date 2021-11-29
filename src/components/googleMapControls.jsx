import React from "react";
import PropTypes from "prop-types";
import * as urls from "../urls.js";

const SEARCH_BAR_ID = "gMapSearchBar";

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
        <div className="col-md">
          <input
            type="search"
            id={SEARCH_BAR_ID}
            placeholder="Search"
            className="form-control my-2"
          />
        </div>
        <div className="col">
          <div className="row">
            <div className="col">
              <MapControlButton
                isActive={mode === "newPath"}
                onClick={() => changeMode("newPath")}
                icon={urls.ADD_NEW_ICON}
              />
            </div>
            <div className="col">
              <MapControlButton
                isActive={mode === "editPoints"}
                onClick={() => changeMode("editPoints")}
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
                isActive={mode === "locked"}
                onClick={() => changeMode("toggleLock")}
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

export { MapControls, SEARCH_BAR_ID };
