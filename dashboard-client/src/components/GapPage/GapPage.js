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

  // ✅ תשתנה אוטומטית לפי סביבת עבודה
  const BASE_URL = window.location.hostname.includes("localhost")
    ? "http://localhost:3001"
    : "https://drawbet-backend.onrender.com";

  useEffect(() => {
    const endpoint = gapType.toLowerCase() === "flexible11" ? "flexible11" : gapType.toLowerCase();

    // 📥 טען את נתוני ה־Gap / Flexible11
    axios.get(`${BASE_URL}/api/${endpoint}`)
      .then(res => {
        if (!Array.isArray(res.data)) {
          console.error("❌ Invalid response:", res.data);
          return;
        }

        let merged = [];
        let headersDetected = null;

        for (const entry of res.data) {
          const { season, rows } = entry;
          if (!Array.isArray(rows) || rows.length === 0) continue;

          if (typeof rows[0] === "object" && !Array.isArray(rows[0])) {
            const keys = Object.keys(rows[0]);
            if (!headersDetected) headersDetected = ["Season", ...keys];

            rows.forEach(obj => {
              const row = [season, ...keys.map(k => obj[k])];
              merged.push(row);
            });

          } else if (Array.isArray(rows[0])) {
            const keys = rows[0];
            if (!headersDetected) headersDetected = ["Season", ...keys];

            rows.slice(1).forEach(arr => {
              if (Array.isArray(arr)) {
                merged.push([season, ...arr]);
              }
            });
          }
        }

        if (headersDetected && merged.length > 0) {
          setHeaders(headersDetected);
          setData(merged);
        } else {
          console.warn("⚠️ No valid rows in response", res.data);
        }
      })
      .catch(err => console.error("❌ Server error:", err));

    // 📥 טען קבוצות עולות/יורדות
    axios.get(`${BASE_URL}/api/promorelegated`)
      .then(res => {
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
      })
      .catch(err => console.error("❌ Server error (promorelegated):", err));
  }, [gapType]);

  const yearOptions = [
    "All",
    ...[...new Set(data.map(r => r[0]))].filter(Boolean).sort().reverse()
  ];

  const cleanTeamName = (team, league) => {
    if (!team || !league) return team;
    return team.startsWith(league + " ") ? team.replace(`${league} `, "") : team;
  };

  const getTeamColor = (teamRaw, league) => {
    const team = cleanTeamName(teamRaw, league);
    const t = team?.toString().trim();
    if (bigTeams.includes(t)) return "#cfe2f3";        // כחול לקבוצות חזקות
    if (promotedTeams.includes(t)) return "#f4cccc";   // ורוד לעולות
    if (relegatedTeams.includes(t)) return "#d9ead3";  // ירוק ליורדות
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
    const rowYear = row[0]?.toString().trim();
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

        <button
          style={{ marginLeft: "20px", backgroundColor: "#d9534f", color: "white", padding: "5px 10px" }}
          onClick={async () => {
            if (window.confirm("רענון מלא של כל העונות 2017–2024 מה־API. אתה בטוח?")) {
              try {
                const seasons = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
                for (const season of seasons) {
                  await axios.post(`${BASE_URL}/api/refresh/${season}`);
                }
                alert("✅ כל העונות רועננו והוקלטו בקובץ ה־Cache");
                window.location.reload();
              } catch (err) {
                console.error("❌ Refresh all failed:", err);
                alert("שגיאה בעת רענון כולל");
              }
            }
          }}
        >
          רענן הכל
        </button>
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
                    display = gapType === "Gap10" ? "מספר עם פער 10+" : gapType === "Gap8" ? "מספר עם פער 8+" : h;
                  return <th key={i}>{display}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const endMDIndex = headers?.findIndex?.(h =>
                  h?.toString().trim().toLowerCase() === "end md"
                );
                const isEnd = endMDIndex !== -1 && row[endMDIndex]?.toString().trim() === "38";
                const highlightCols = ["start md", "end md", "clean length", "total streak length", "breaker md"];
                const league = row[3];

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
