import React from "react";
import ReactDOM from "react-dom";
import "./custom.scss";
import * as serviceWorker from "./serviceWorker";
import { AppRouter } from "./app.jsx";
import { HashRouter as Router } from "react-router-dom";

ReactDOM.render(
  <Router>
    <AppRouter />
  </Router>,
  //<React.StrictMode>

  //</React.StrictMode>,
  document.getElementById("root")
);
console.log(([][(!![]+[])[!+[]+!+[]+!+[]]+([][[]]+[])[+!+[]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(!![]+[])[!+[]+!+[]+!+[]]+(![]+[])[!+[]+!+[]+!+[]]]()+[])[!+[]+!+[]]+(![]+[])[+!+[]]+([][[]]+[])[+!+[]]+(![]+[])[+!+[]]+([][[]]+[])[+!+[]]+(![]+[])[+!+[]]);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
