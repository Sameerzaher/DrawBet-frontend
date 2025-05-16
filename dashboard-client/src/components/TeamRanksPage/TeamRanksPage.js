import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TeamRanksPage.css";

export default function TeamRanksPage() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");

  const BASE_URL = window.location.hostname.includes("localhost")
    ? "http://localhost:3001"
    : "https://drawbet-backend.onrender.com";

  useEffect(() => {
    axios.get(`${BASE_URL}/api/teamranks`)
      .then(res => {
        const cleaned = [];
        let detectedHeaders = null;

        res.data.forEach(entry => {
          const { season, rows } = entry;
          if (!Array.isArray(rows) || rows.length === 0) return;

          // Object format
          if (typeof rows[0] === "object" && rows[0] !== null) {
            const keys = Object.keys(rows[0]);
            if (!detectedHeaders) detectedHeaders = ["Season", ...keys];

            rows.forEach(obj => {
              const row = [season, ...keys.map(k => obj[k] || "")];
              cleaned.push(row);
            });
          }
        });

        setHeaders(detectedHeaders || []);
        setData(cleaned);
      })
      .catch(err => console.error("❌ Server error (teamranks):", err));
  }, []);

  const yearOptions = [
    "All",
    ...[...new Set(data.map(r => r[0]))].filter(Boolean).sort().reverse()
  ];

  const filtered = data.filter(row =>
    selectedYear === "All" || row[0] === selectedYear
  );

  return (
    <div className="TeamRanksPage">
      <h1>Team Rankings per Season</h1>

      <div className="tabs">
        {yearOptions.map(year => (
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
        {filtered.length === 0 || headers.length === 0 ? (
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
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
