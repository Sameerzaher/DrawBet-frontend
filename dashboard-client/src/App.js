import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../src/components/Sidebar/Sidebar";
import GapPage from "../src/components/GapPage/GapPage";
import TeamRanksPage from "../src/components/TeamRanksPage/TeamRanksPage";
import PromotedPage from "../src/components/PromoRelegPage/PromoRelegPage";
import FlexibleStreaksPage from "./components/FlexibleStreaksPage/FlexibleStreaksPage";
function App() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "220px", padding: "20px", flex: 1 }}>
      <Routes>
          <Route path="/esp/gap8" element={<GapPage gapType="Gap8" />} />
          <Route path="/esp/gap8/:year" element={<GapPage gapType="Gap8" />} />

          <Route path="/esp/gap10" element={<GapPage gapType="Gap10" />} />
          <Route path="/esp/gap10/:year" element={<GapPage gapType="Gap10" />} />

          <Route path="/esp/flexible11" element={<FlexibleStreaksPage />} />
          <Route path="/esp/flexible11/:year" element={<FlexibleStreaksPage />} />

          <Route path="/esp/teamranks" element={<TeamRanksPage league="ESP" />} />
          <Route path="/esp/promoted" element={<PromotedPage league="ESP" />} />

          <Route path="/" element={<GapPage gapType="Gap8" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
