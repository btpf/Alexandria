import ReactDOM from "react-dom/client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";


import store from './Redux/store'
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
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);