import React, { useEffect, useState } from "react";
import axios from "axios";
import "./GapPage.css";

export default function GapPage({ gapType }) {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");

  const bigTeams = ["Barcelona", "Real Madrid", "Atletico Madrid"];
  const promotedTeams = [
    "Girona", "Getafe", "Levante", "Huesca", "Rayo Vallecano", "Valladolid",
    "Almeria", "Granada CF", "Cadiz", "Elche", "Mallorca", "Las Palmas"
  ];

  useEffect(() => {
    axios.get("http://localhost:4000/api/activity")
      .then(res => {
        const raw = res.data;
        if (raw.length > 0) {
          console.log("✅ Loaded rows:", raw.length);
          setHeaders(raw[0]);
          setData(raw.slice(1));
        } else {
          console.warn("⚠️ No data from server");
        }
      })
      .catch(err => console.error("❌ Server error:", err));
  }, []);

  // הפקת רשימת שנים מתוך הנתונים
  const yearOptions = [
    "All",
    ...[...new Set(data.map(r => r[0]?.toString().trim()))]
      .filter(Boolean)
      .sort()
      .reverse()
  ];

  const getCellColor = (val) => {
    const v = val?.toString().trim().toLowerCase();
    if (v === "big") return "#cfe2f3";
    if (v === "promoted") return "#f4cccc";
    if (v === "gap") return "#fff2cc";
    return "";
  };

  const getTeamColor = (team) => {
    const t = team?.toString().trim();
    if (bigTeams.includes(t)) return "#cfe2f3";
    if (promotedTeams.includes(t)) return "#f4cccc";
    return "";
  };

  const cleanTeamName = (team, league) => {
    if (!team || !league) return team;
    return team.startsWith(league + " ") ? team.replace(`${league} `, "") : team;
  };

  // סינון לפי Gap וסינון לפי שנה
  const filtered = data.filter(row => {
    const rowGap = row[1]?.toString().trim().toLowerCase();
    const rowYear = row[0]?.toString().trim();
    return rowGap === gapType.toLowerCase() &&
      (selectedYear === "All" || rowYear === selectedYear);
  });

  return (
    <div className="GapPage">
      <h1>{gapType} – Dashboard</h1>

      {/* בחירת שנה */}
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

      {/* טבלה או הודעה */}
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
                const endMDIndex = headers.findIndex(h =>
                  h?.toString().trim().toLowerCase() === "end md"
                );
                const isEnd = row[endMDIndex]?.toString().trim() === "38";
                const highlightCols = ["start md", "end md", "clean length", "total streak length", "breaker md"];

                return (
                  <tr key={i}>
                    {row.map((cell, j) => {
                      const header = headers[j]?.toString().trim().toLowerCase();
                      const isReason = header.includes("reason");
                      const isTeam = header === "team";
                      const teamName = isTeam ? cleanTeamName(cell, row[2]) : cell;

                      const bgColor = isReason
                        ? getCellColor(cell)
                        : isTeam
                          ? getTeamColor(teamName)
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
