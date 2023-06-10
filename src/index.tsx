import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Router from "./routes/Router";

import 'sanitize.css';
import 'sanitize.css/forms.css';
import 'sanitize.css/typography.css';
// import './utils/styles/breakpoints.css'

import store from './store/store'
import { Provider } from 'react-redux'

import InitializeApp from "./InitializeApp";
// import bookImport from '@resources/placeholder/courage.epub'

// https://stackoverflow.com/a/63520782
const portalDiv = document.getElementById("root");
if(!portalDiv){
  throw new Error("The element #root wasn't found");
}

const root = ReactDOM.createRoot(
  portalDiv
);

function Root() {
  return (
    <Provider store={store}>
      <InitializeApp></InitializeApp>
      <RouterProvider router={createBrowserRouter(Router)} />
    </Provider>
  )
}


root.render(
  <Root/>
  // <React.StrictMode>

);