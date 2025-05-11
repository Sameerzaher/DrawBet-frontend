import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import GapPage from "./components/GapPage/GapPage.js";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="main-nav">
          <Link to="/gap8">Gap 8</Link>
          <Link to="/gap10">Gap 10</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/gap8" />} />
          <Route path="/gap8" element={<GapPage gapType="Gap8" />} />
          <Route path="/gap10" element={<GapPage gapType="Gap10" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
