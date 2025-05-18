import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import "./GapPage.css";

export default function GapPage({ gapType }) {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [promotedTeams, setPromotedTeams] = useState([]);
  const [relegatedTeams, setRelegatedTeams] = useState([]);
  const [sortConfig, setSortConfig] = useState({ columnIndex: null, direction: "asc" });

  const navigate = useNavigate();
  const { year: urlYear } = useParams();

  const bigTeams = ["Barcelona", "Real Madrid", "Atletico Madrid"];
  const BASE_URL = window.location.hostname.includes("localhost")
    ? "http://localhost:3001"
    : "https://drawbet-backend.onrender.com";

  useEffect(() => {
    if (urlYear) setSelectedYear(urlYear);
  }, [urlYear]);

  useEffect(() => {
    const endpoint = gapType.toLowerCase();
    axios.get(`${BASE_URL}/api/${endpoint}`).then(res => {
      if (!Array.isArray(res.data)) return;
      let merged = [];
      let headersDetected = null;
      for (const entry of res.data) {
        const { season, rows } = entry;
        if (!Array.isArray(rows) || rows.length === 0) continue;
        if (typeof rows[0] === "object") {
          const keys = Object.keys(rows[0]);
          if (!headersDetected) headersDetected = ["Season", ...keys];
          rows.forEach(obj => merged.push([season, ...keys.map(k => obj[k])]));
        } else if (Array.isArray(rows[0])) {
          const keys = rows[0];
          if (!headersDetected) headersDetected = ["Season", ...keys];
          rows.slice(1).forEach(arr => merged.push([season, ...arr]));
        }
      }
      if (headersDetected && merged.length > 0) {
        setHeaders(headersDetected);
        setData(merged);
        console.log("📊 Merged Data:", merged); // debug output
      }
    });

    axios.get(`${BASE_URL}/api/promorelegated`).then(res => {
      const promotedSet = new Set();
      const relegatedSet = new Set();
      res.data.forEach(entry => {
        entry.rows?.forEach(row => {
          if (!Array.isArray(row)) return;
          row[1]?.split(",").forEach(t => promotedSet.add(t.trim()));
          row[2]?.split(",").forEach(t => relegatedSet.add(t.trim()));
        });
      });
      setPromotedTeams([...promotedSet]);
      setRelegatedTeams([...relegatedSet]);
    });
  }, [gapType]);

  const cleanTeamName = (team, league) => {
    if (!team || !league) return team;
    return team.startsWith(league + " ") ? team.replace(`${league} `, "") : team;
  };

  const getTeamColor = (teamRaw, league) => {
    const t = cleanTeamName(teamRaw, league)?.toString().trim();
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

  const yearOptions = useMemo(() => [
    "All",
    ...[...new Set(data.map(r => r[0]))].filter(Boolean).sort().reverse()
  ], [data]);

  const filtered = data.filter(row => selectedYear === "All" || row[0]?.toString().trim() === selectedYear);

  const sortedData = useMemo(() => {
    if (sortConfig.columnIndex === null) return filtered;
    return [...filtered].sort((a, b) => {
      const valA = a[sortConfig.columnIndex];
      const valB = b[sortConfig.columnIndex];
      const isNumber = !isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB));
      return isNumber
        ? sortConfig.direction === "asc" ? parseFloat(valA) - parseFloat(valB) : parseFloat(valB) - parseFloat(valA)
        : sortConfig.direction === "asc" ? valA?.toString().localeCompare(valB) : valB?.toString().localeCompare(valA);
    });
  }, [filtered, sortConfig]);

  const handleSort = (index) => {
    setSortConfig(prev =>
      prev.columnIndex === index
        ? { columnIndex: index, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { columnIndex: index, direction: "asc" }
    );
  };

  const handleSidebarYearClick = (year) => {
    setSelectedYear(year);
    navigate(`/esp/${gapType.toLowerCase()}/${year === "All" ? "" : year}`);
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        selectedYear={selectedYear}
        gapType={gapType}
        onYearClick={handleSidebarYearClick}
        yearOptions={yearOptions}
      />
      <div className="GapPage">
        <main className="main-content">
          <div className="header-fixed">
            <h1 className="centered-title">{gapType} – Dashboard</h1>
            <div className="tabs">
              <button
                className="refresh"
                onClick={async () => {
                  if (window.confirm("רענון מלא של כל העונות 2017–2024 מה‌API. אתה בטוח?")) {
                    try {
                      const seasons = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
                      for (const season of seasons) {
                        await axios.post(`${BASE_URL}/api/refresh/${season}`);
                      }
                      alert("✅ כל העונות רועננו בהצלחה");
                      window.location.reload();
                    } catch (err) {
                      console.error("❌ Refresh all failed:", err);
                      alert("שגיאה בעת רענון");
                    }
                  }
                }}
              >
                רענן הכל
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {headers.map((h, i) => {
                      const isSorted = sortConfig.columnIndex === i;
                      const arrow = isSorted ? (sortConfig.direction === "asc" ? " 🔼" : " 🔽") : "";
                      return (
                        <th key={i} onClick={() => handleSort(i)} style={{ cursor: "pointer" }}>
                          {h}{arrow}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row, i) => {
                    const league = row[3];
                    const endMDIndex = headers.findIndex(h => h.toLowerCase() === "end md");
                    const isEnd = endMDIndex !== -1 && row[endMDIndex]?.toString().trim() === "38";
                    const highlightCols = ["start md", "end md", "clean length", "total streak length", "breaker md"];

                    return (
                      <tr key={i}>
                        {row.map((cell, j) => {
                          const header = headers[j]?.toLowerCase().trim();
                          const isTeam = header === "team";
                          const isReason = header?.includes("reason");

                          const bgColor = isReason
                            ? getCellColor(cell)
                            : isTeam
                              ? getTeamColor(cell, league)
                              : "";

                          const isEndCol = isEnd && highlightCols.includes(header);
                          const finalColor = bgColor || (isEndCol ? "#fce5cd" : "");

                          return (
                            <td key={j} style={{ backgroundColor: finalColor }}>
                              {isTeam ? cleanTeamName(cell, league) : cell}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
