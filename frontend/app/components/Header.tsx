import { Search } from "lucide-react";
import logo from "../assets/logo.png";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";

export type HeaderTab = "leaderboard" | "head-to-head" | "higher-or-lower";

type HeaderProps = {
  activeTab: HeaderTab;
  onTabChange: (tab: HeaderTab) => void;
};

export default function Header({ activeTab, onTabChange }: HeaderProps) {
    const currentTabStyle = "text-lg font-semibold text-black bg-[#DC2626] px-4 py-2 rounded-md";
    const defaultTabStyle = "text-lg font-semibold text-gray-400";

    const dispatch = useDispatch();
    const searchQuery = useSelector((state: RootState) => state.search.query);
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        dispatch({ type: "search/setQuery", payload: query });
    };


  return (
    <div className="flex items-center justify-between px-8 py-4 bg-transparent border-b border-gray-800 text-white">
      <Image
        src={logo}
        alt="TV Arena Logo"
        width={120}
        height={100}
        className="h-8 w-auto"
        priority
      />

      <div className="border border-gray-800 rounded-md px-2 py-2 text-white flex justify-center items-center gap-8" >
        <button type="button" className={activeTab === "leaderboard" ? currentTabStyle : defaultTabStyle} onClick={() => onTabChange("leaderboard")}>
          Leaderboard
        </button>

        <button type="button" className={activeTab === "head-to-head" ? currentTabStyle : defaultTabStyle} onClick={() => onTabChange("head-to-head")}>
          Head-to-Head Arena
        </button>

        <button type="button" className={activeTab === "higher-or-lower" ? currentTabStyle : defaultTabStyle} onClick={() => onTabChange("higher-or-lower")}>
          Higher or Lower Game
        </button>
      </div>

      <div className="flex items-center p-2 rounded-md text-white border border-gray-800 outline-none w-75 bg-[#18181B]">
        <Search className="mr-2 " size={18} color="#A1A1AA" />
        <input
          type="text"
          placeholder="Search shows... ⌘k"
          onChange={handleSearchChange}
          value={searchQuery}
          className="outline-none text-gray-200"
        />
      </div>
    </div>
  );
}
