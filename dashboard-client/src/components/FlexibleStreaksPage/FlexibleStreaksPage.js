import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FlexibleStreaksPage.css";

export default function FlexibleStreaksPage() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://drawbet-backend.onrender.com"
    : "http://localhost:3001";


  useEffect(() => {
    axios.get(`${BASE_URL}/api/flexible11`) // ← מתייחס לכל השנים עם הטאב Flexible_CleanStreaks_11_Unique_{{season}}
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
      })
      .catch(err => console.error("❌ Server error (flexible11):", err));
  }, [BASE_URL]);

  const yearOptions = [
    "All",
    ...[...new Set(data.map(r => r[0]))].filter(Boolean).sort().reverse()
  ];

  const filtered = data.filter(row =>
    Array.isArray(row) &&
    row.length > 1 &&
    (selectedYear === "All" || row[0] === selectedYear)
  );

  return (
    <div className="FlexibleStreaksPage">
      <h1>Flexible Clean Streaks 11+ Dashboard</h1>

      <div className="tabs">
        {yearOptions.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={selectedYear === year ? "active" : ""}
          >
            {year === "All" ? "All Years" : year}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <p>No data to display</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}
