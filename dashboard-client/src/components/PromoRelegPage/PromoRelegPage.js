import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PromoRelegPage.css";

export default function PromoRelegPage() {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");

  const BASE_URL = window.location.hostname.includes("localhost")
    ? "http://localhost:3001"
    : "https://drawbet-backend.onrender.com";

  useEffect(() => {
    axios.get(`${BASE_URL}/api/promorelegated`)
      .then(res => {
        const cleaned = res.data.flatMap(entry => {
          const season = entry.season;
          const rows = entry.rows || [];

          return rows
            .filter(row => typeof row === "object" && row["קבוצות שעלו"] && row["קבוצות שירדו"])
            .map(row => {
              const promoted = row["קבוצות שעלו"] || "—";
              const relegated = row["קבוצות שירדו"] || "—";
              return [season, promoted, relegated];
            });
        });

        setData(cleaned);
      })
      .catch(err => console.error("❌ Server error (promorelegated):", err));
  }, []);

  const yearOptions = [
    "All",
    ...[...new Set(data.map(r => r[0]))].filter(Boolean).sort().reverse()
  ];

  const filtered = data.filter(row =>
    selectedYear === "All" || row[0] === selectedYear
  );

  return (
    <div className="PromoRelegPage">
      <h1>Promoted & Relegated Teams</h1>

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
        {filtered.length === 0 ? (
          <p>No data available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Season</th>
                <th>Promoted Teams</th>
                <th>Relegated Teams</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const [season, promoted, relegated] = row;
                return (
                  <tr key={i}>
                    <td>{season}</td>
                    <td style={{ backgroundColor: "#f4cccc" }}>{promoted}</td>
                    <td style={{ backgroundColor: "#d9ead3" }}>{relegated}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
