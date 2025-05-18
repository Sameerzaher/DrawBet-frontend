import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidebar from "../Sidebar/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import "./FlexibleStreaksPage.css";

export default function FlexibleStreaksPage() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");

  const { year } = useParams();
  const navigate = useNavigate();

  const BASE_URL = window.location.hostname.includes("localhost")
    ? "http://localhost:3001"
    : "https://drawbet-backend.onrender.com";

  useEffect(() => {
    if (year) setSelectedYear(year);
  }, [year]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/flexible11`)
      .then(res => {
        const merged = res.data.flatMap(entry => {
          return entry.rows.map(row => {
            if (Array.isArray(row)) return [entry.season, ...row];
            if (typeof row === "object" && row !== null)
              return [entry.season, ...Object.values(row)];
            return null;
          }).filter(Boolean);
        });

        const first = res.data.find(d => d.rows.length > 0);
        if (first && Array.isArray(first.rows[0])) {
          setHeaders(["Season", ...first.rows[0]]);
        } else if (first && typeof first.rows[0] === "object") {
          setHeaders(["Season", ...Object.keys(first.rows[0])]);
        }

        setData(merged);
        console.log("📊 Flexible Merged Data:", merged);
      })
      .catch(err => console.error("❌ Server error (flexible11):", err));
  }, []);

  const yearOptions = useMemo(() => [
    "All",
    ...[...new Set(data.map(r => r[0]))].filter(Boolean).sort().reverse()
  ], [data]);

  const filtered = useMemo(() => {
    return data.filter(row =>
      Array.isArray(row) &&
      row.length > 1 &&
      (selectedYear === "All" || row[0] === selectedYear)
    );
  }, [data, selectedYear]);

  const handleSidebarYearClick = (yr) => {
    setSelectedYear(yr);
    navigate(`/esp/flexible11/${yr === "All" ? "" : yr}`);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        selectedYear={selectedYear}
        gapType="flexible11"
        onYearClick={handleSidebarYearClick}
        yearOptions={yearOptions}
      />

      <div className="FlexibleStreaksPage">
        <main className="main-content">
          <h1 className="centered-title">Flexible Clean Streaks 11+ Dashboard</h1>

          <div className="table-wrapper">
            {filtered.length === 0 ? (
              <p>No data to display</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {headers.map((h, i) => <th key={i}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => <td key={j}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
