import {Route, createRoutesFromElements, useRouteError } from "react-router-dom";
import React from "react";

import Home from './Home/Home'
import Reader from "./Reader/Reader";
import Settings from "./Settings/Settings";

export default (
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="/settings/*" element={<Settings />} />
      <Route path="/reader" element={<Reader />} />
      <Route path="/reader/:bookHash/" element={<Reader />}/>
    </>
  )
);