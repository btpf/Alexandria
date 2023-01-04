import {Route, createRoutesFromElements, useRouteError } from "react-router-dom";
import React from "react";

import Home from './Home/Home'
import Reader from "./Reader/Reader";

export default (
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="/reader" element={<Reader />} />
      <Route path="/reader/:bookHash/" element={<Reader />}/>
    </>
  )
);