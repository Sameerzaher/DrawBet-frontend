import React, { useEffect, useState } from "react";
import axios from "axios";
import "./GapPage.css";

export default function GapPage({ gapType }) {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [promotedTeams, setPromotedTeams] = useState([]);
  const [relegatedTeams, setRelegatedTeams] = useState([]);

  const bigTeams = ["Barcelona", "Real Madrid", "Atletico Madrid"];
  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`${BASE_URL}/api/${gapType.toLowerCase()}`);
        const entries = res.data;

        let merged = [];
        let headersDetected = null;

        for (const entry of entries) {
          const { season, rows } = entry;
          if (!Array.isArray(rows) || rows.length === 0) continue;

          if (Array.isArray(rows[0])) {
            const keys = rows[0];
            if (!headersDetected) headersDetected = ["Season", ...keys];
            for (let i = 1; i < rows.length; i++) {
              const row = rows[i];
              if (Array.isArray(row)) {
                merged.push([season, ...row]);
              }
            }
          } else if (typeof rows[0] === "object" && rows[0] !== null) {
            const keys = Object.keys(rows[0]);
            if (!headersDetected) headersDetected = ["Season", ...keys];
            for (const row of rows) {
              const values = keys.map(k => row[k]);
              merged.push([season, ...values]);
            }
          }
        }

        if (headersDetected && merged.length > 0) {
          setHeaders(headersDetected);
          setData(merged);
        } else {
          console.warn("⚠️ No valid rows in gap data", entries);
        }
      } catch (err) {
        console.error("❌ Server error (gap data):", err);
      }

      try {
        const res = await axios.get(`${BASE_URL}/api/promorelegated`);
        const promotedSet = new Set();
        const relegatedSet = new Set();

        res.data.forEach(entry => {
          entry.rows?.forEach(row => {
            if (!Array.isArray(row)) return;
            const promoted = row[1]?.split(",") || [];
            const relegated = row[2]?.split(",") || [];
            promoted.forEach(t => promotedSet.add(t.trim()));
            relegated.forEach(t => relegatedSet.add(t.trim()));
          });
        });

        setPromotedTeams(Array.from(promotedSet));
        setRelegatedTeams(Array.from(relegatedSet));
      } catch (err) {
        console.error("❌ Server error (promorelegated):", err);
      }
    }

    loadData();
  }, [gapType, BASE_URL]);

  const yearOptions = [
    "All",
    ...[...new Set(data.map(r => r[0]))].filter(Boolean).sort().reverse()
  ];

  const cleanTeamName = (team, league) => {
    if (!team || !league) return team;
    return team.startsWith(league + " ") ? team.replace(`${league} `, "") : team;
  };

  const getTeamColor = (teamRaw, league) => {
    const team = cleanTeamName(teamRaw, league || "");
    const t = team?.toString().trim();
    if (bigTeams.includes(t)) return "#cfe2f3";
    if (promotedTeams.includes(t)) return "#f4cccc";
    if (relegatedTeams.includes(t)) return "#d9ead3";
    return "";
  };

  const getCellColor = (val) => {
    const v = val?.toString().trim().toLowerCase();
    if (v === "big") return "#cfe2f3";
    if (v === "promoted") return "#f4cccc";
    if (v === "gap") return "#fff2cc";
    return "";
  };

  const filtered = data.filter(row => {
    const rowYear = row?.[0]?.toString().trim();
    return selectedYear === "All" || rowYear === selectedYear;
  });

  return (
    <div className="GapPage">
      <h1>{gapType} – Dashboard</h1>

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
                {headers.map((h, i) => {
                  let display = h;
                  if (h.includes("מספר עם פער"))
                    display = gapType === "Gap10" ? "מספר עם פער 10+" : "מספר עם פער 8+";
                  return <th key={i}>{display}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                if (!Array.isArray(row)) return null;
                const endMDIndex = headers.findIndex(h =>
                  h?.toString().trim().toLowerCase() === "end md"
                );
                const isEnd = row?.[endMDIndex]?.toString().trim() === "38";
                const highlightCols = ["start md", "end md", "clean length", "total streak length", "breaker md"];
                const league = row?.[3] || "";

                return (
                  <tr key={i}>
                    {row.map((cell, j) => {
                      const header = headers[j]?.toString().trim().toLowerCase();
                      const isReason = header?.includes("reason");
                      const isTeam = header === "team";
                      const teamName = isTeam ? cleanTeamName(cell, league) : cell;

                      const bgColor = isReason
                        ? getCellColor(cell)
                        : isTeam
                          ? getTeamColor(cell, league)
                          : "";

                      const isEndCol = isEnd && highlightCols.includes(header);
                      const finalColor = bgColor || (isEndCol ? "#fce5cd" : "");

                      return (
                        <td key={j} style={{ backgroundColor: finalColor }}>
                          {teamName}
                        </td>
                      );
                    })}
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