import React, { useState } from "react";
import PropTypes from "prop-types";
import * as obj from "../objectDefinitions";
import * as df from "./dateFunctions";
import { StandardModal } from "./reactComponents.jsx";

function TimeInputButton({ app, value, returnDateTime, children }) {
  function editDateTime() {
    app.setModal(
      <TimeInputModal
        defaultDateTime={df.formatDate(value)}
        returnDateTime={returnDateTime}
        app={app}
      >
        {children}
      </TimeInputModal>
    );
  }

  return (
    <button
      className={`btn text-left text-light btn-info btn-block my-2`}
      onClick={editDateTime}
    >
      {children}:{" "}
      <em>
        {df.displayDate(value)}, {df.displayTime(value)}
      </em>
    </button>
  );
}
TimeInputButton.propTypes = {
  app: PropTypes.shape(obj.AppFunctions),
  value: PropTypes.instanceOf(Date),
  returnDateTime: PropTypes.func,
  children: PropTypes.node,
};

function TimeInputModal({ app, defaultDateTime, returnDateTime, children }) {
  const [date, setDate] = useState(defaultDateTime);
  const [time, setTime] = useState(defaultDateTime);

  function formatDateTime() {
    const D = date.split(/\D/);
    const T = time.split(/\D/);
    const newDate = new Date(D[0], D[1] - 1, D[2], T[0], T[1]);
    returnDateTime(newDate);
    app.hideModal();
  }

  const title = <div>{children}</div>;
  const body = (
    <form className="form-row">
      <div className="col-6">
        <input
          className="form-control my-2"
          type="date"
          defaultValue={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="col-6">
        <input
          className="form-control my-2"
          type="time"
          defaultValue={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
    </form>
  );

  const footer = (
    <button className="btn btn-block btn-success" onClick={formatDateTime}>
      Continue
    </button>
  );
  return (
    <StandardModal
      title={title}
      body={body}
      footer={footer}
      hideModal={app.hideModal}
    />
  );
}
TimeInputModal.propTypes = {
  app: PropTypes.shape(obj.AppFunctions),
  defaultDateTime: PropTypes.instanceOf(Date),
  returnDateTime: PropTypes.func,
  children: PropTypes.node,
};

export { TimeInputButton, TimeInputModal };
