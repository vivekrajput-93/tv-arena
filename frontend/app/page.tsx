"use client";

import { Suspense, useState } from "react";
import Header, { type HeaderTab } from "./components/Header";
import LeaderboardPage from "./pages/LeaderboardPage";
import HeadToHeadArena from "./pages/HeadToHeadArena";
import HigherOrLowerGame from "./pages/HigherOrLowerGame";

export default function Home() {
  const [activeTab, setActiveTab] = useState<HeaderTab>("leaderboard");

  const handleCompareFromLeaderboard = () => {
    setActiveTab("head-to-head");
  };

  const renderActivePage = () => {
    if (activeTab === "head-to-head") {
      return <HeadToHeadArena />;
    }

    if (activeTab === "higher-or-lower") {
      return <HigherOrLowerGame />;
    }

    return <LeaderboardPage onCompareClick={handleCompareFromLeaderboard} />;
  };

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <Suspense fallback={<div>Loading...</div>}>
        {renderActivePage()}
      </Suspense>
    </>
  );
}
