import React from 'react';
import ReactDOM from 'react-dom';
import './custom.scss';
import * as serviceWorker from './serviceWorker';
import {App} from './app.js';
import * as urls from './urls.js';
import {ViewerApp} from './viewerApp.js';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

ReactDOM.render(
  <Router>
    <Switch>
        <Route 
          path={`${urls.VIEWER}/:username`}
          component={ViewerApp}
        />
        <Route path="*">
          <App/>
        </Route>
    </Switch>
  </Router>
  ,
  //<React.StrictMode>
    
  //</React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
