import ReactDOM from "react-dom/client";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Router from "./routes/Router";

import 'sanitize.css';
import 'sanitize.css/forms.css';
import 'sanitize.css/typography.css';
// import './utils/styles/breakpoints.css'

import store from './store/store'
import { Provider } from 'react-redux'


// https://stackoverflow.com/a/63520782
const portalDiv = document.getElementById("root");
if(!portalDiv){
  throw new Error("The element #root wasn't found");
}

const root = ReactDOM.createRoot(
  portalDiv
);


root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <RouterProvider router={createBrowserRouter(Router)} />
  </Provider>
);