import { Routes, Route, Link } from "react-router-dom";
import React from "react";

import Home from './Home/Home'

export default function App() {
  // console.log(test)
  return (
    // <div className="App" style={{height:"100%"}}>
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="about" element={<About />} /> */}
    </Routes>
    // </div>
  );
}