import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import List from "./pages/List/list";
import Detail from "./pages/Detail/detail";
import Notfound from "./pages/NotFound/notFound";

import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";


const routing = (
  <Router>
    <div>
      <Switch>
        <Route exact path="/" component={List} />
        <Route path="/detail/:id" component={Detail} />
        <Route component={Notfound} />
      </Switch>
    </div>
  </Router>
);


ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
