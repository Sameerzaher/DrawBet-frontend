import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ selectedYear, gapType, onYearClick, yearOptions }) {
  const location = useLocation();
  const current = location.pathname;

  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen(prev => !prev);

  const gapLinks = [
    { path: "/esp/gap8", label: "Gap 8", key: "gap8" },
    { path: "/esp/gap10", label: "Gap 10", key: "gap10" },
    { path: "/esp/flexible11", label: "Flexible 11", key: "flexible11" }
  ];

  const otherLinks = [
    { path: "/esp/teamranks", label: "דירוג קבוצות" },
    { path: "/esp/promoted", label: "עולות / יורדות" },
  ];

  return (
    <div className="sidebar">
      <h2>DrawBet</h2>
      <div className="section-header" onClick={toggle}>
        Spain {isOpen ? "▼" : "▶"}
      </div>

      {isOpen && (
        <>
          {gapLinks.map(link => {
            const isActiveTab = current.startsWith(link.path);
            const isGapTypeMatch = gapType?.toLowerCase() === link.key;

            return (
              <div key={link.path} className="nav-block">
                <Link
                  to={link.path}
                  className={isActiveTab ? "active" : ""}
                >
                  {link.label}
                </Link>

                {/* הצג שנים רק אם זה הטאב הפעיל והסוג תואם */}
                {isGapTypeMatch && yearOptions && (
                  <div className="year-buttons">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        className={selectedYear === year ? "active-year" : ""}
                        onClick={() => onYearClick(year)}
                      >
                        {year === "All" ? "כל השנים" : year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {otherLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={current === link.path ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
