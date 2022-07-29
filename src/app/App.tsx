import { Routes, Route, Link } from "react-router-dom";
import React from "react";

import Home from '../routes/Home'

export default function App() {
  // console.log(test)
  return (
    <div className="App">
      <h1>Welcome to React Router!</h1>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="about" element={<About />} /> */}
      </Routes>
    </div>
  );
}