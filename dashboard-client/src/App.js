// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import GapPage from "./components/GapPage/GapPage";
import "./App.css";
import FlexibleStreaksPage from "./components/FlexibleStreaksPage/FlexibleStreaksPage";



function App() {
  return (
    <Router>
      <div className="App">
        <nav className="main-nav">
          <Link to="/gap8">Gap 8</Link>
          <Link to="/gap10">Gap 10</Link>
          <Link to="/flexible11">Flexible 11</Link>

        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/gap8" />} />
          <Route path="/gap8" element={<GapPage gapType="Gap8" />} />
          <Route path="/gap10" element={<GapPage gapType="Gap10" />} />
          <Route path="/flexible11" element={<FlexibleStreaksPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
