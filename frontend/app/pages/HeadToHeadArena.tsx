"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchShowsQuery, useCompareShowsQuery } from "../hooks/apiSlice";
import { ShowSearchItem } from "../types/type";

export default function HeadToHeadArena() {
  // Input search strings
  const [query1, setQuery1] = useState("");
  const [query2, setQuery2] = useState("");

  // Selected show objects
  const [selectedShow1, setSelectedShow1] = useState<ShowSearchItem | null>(
    null,
  );
  const [selectedShow2, setSelectedShow2] = useState<ShowSearchItem | null>(
    null,
  );

  // Dropdown open states
  const [isDropdown1Open, setIsDropdown1Open] = useState(false);
  const [isDropdown2Open, setIsDropdown2Open] = useState(false);

  // Active slugs being compared
  const [comparedSlugs, setComparedSlugs] = useState<string[]>([]);

  const { data: searchResults1 = [], isFetching: isSearching1 } =
    useSearchShowsQuery(
      {
        q: query1.trim(),
        limit: 20,
      },
      { skip: query1.trim().length < 2 || !!selectedShow1 },
    );

  const { data: searchResults2 = [], isFetching: isSearching2 } =
    useSearchShowsQuery(
      {
        q: query2.trim(),
        limit: 20,
      },
      { skip: query2.trim().length < 2 || !!selectedShow2 },
    );

  const {
    data: compareData,
    isFetching: isComparing,
    error: compareError,
  } = useCompareShowsQuery(comparedSlugs, {
    skip: comparedSlugs.length < 2,
  });

  const handleSelectShow1 = (show: ShowSearchItem) => {
    setSelectedShow1(show);
    setQuery1(show.title);
    setIsDropdown1Open(false);
  };

  const handleSelectShow2 = (show: ShowSearchItem) => {
    setSelectedShow2(show);
    setQuery2(show.title);
    setIsDropdown2Open(false);
  };

  const handleCompare = () => {
    if (selectedShow1 && selectedShow2) {
      setComparedSlugs([selectedShow1.slug, selectedShow2.slug]);
    }
  };

  const showA = compareData?.shows?.[0];
  const showB = compareData?.shows?.[1];

  const handleClearSearch = () => {
    setQuery1("");
    setQuery2("");
    setSelectedShow1(null);
    setSelectedShow2(null);
    setIsDropdown1Open(false);
    setIsDropdown2Open(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 sm:px-8 py-10 text-white">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center">
        The Arena — Battle for Social Momentum
      </h1>
      <p className="text-lg sm:text-2xl text-[#A1A1AA] text-center mb-10">
        Share of voice across rolling 7-day tweet volume.
      </p>

      {/* Selector Box */}
      <div className="w-full max-w-5xl rounded-2xl border border-gray-800 bg-[#18181B] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          {/* Show 1 Input & Dropdown */}
          <div className="relative w-full md:w-2/5">
            <div className="flex items-center justify-between border border-gray-800 rounded-xl bg-[#0f0f12] px-4 py-3">
              <input
                type="text"
                placeholder="Search for Show 1"
                value={query1}
                onFocus={() => setIsDropdown1Open(true)}
                onChange={(e) => {
                  setQuery1(e.target.value);
                  setSelectedShow1(null);
                  setIsDropdown1Open(true);
                }}
                className="w-full bg-transparent text-gray-200 placeholder:text-[#71717A] outline-none text-sm"
              />
              {selectedShow1 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShow1(null);
                    setQuery1("");
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 ml-2"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown 1 */}
            {isDropdown1Open && !selectedShow1 && query1.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-800 bg-[#141417] shadow-2xl z-50 divide-y divide-gray-800">
                {isSearching1 ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    Searching shows...
                  </div>
                ) : searchResults1.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    No shows found
                  </div>
                ) : (
                  searchResults1.map((show: ShowSearchItem) => (
                    <button
                      key={show.id}
                      type="button"
                      onClick={() => handleSelectShow1(show)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#202025] transition-colors"
                    >
                      {show.poster_url ? (
                        <Image
                          src={show.poster_url}
                          alt={show.title}
                          width={32}
                          height={48}
                          className="w-8 h-12 object-cover rounded bg-zinc-800 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-500 shrink-0">
                          N/A
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-sm font-medium text-white truncate">
                          {show.title}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {show.genres?.join(", ")}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="h-12 w-12 rounded-full border border-[#DC2626] bg-[#281516] text-[#DC2626] font-bold flex items-center justify-center tracking-wider shrink-0 shadow-lg shadow-red-950/40">
            VS
          </div>

          {/* Show 2 Input & Dropdown */}
          <div className="relative w-full md:w-2/5">
            <div className="flex items-center justify-between border border-gray-800 rounded-xl bg-[#0f0f12] px-4 py-3">
              <input
                type="text"
                placeholder="Search for Show 2"
                value={query2}
                onFocus={() => setIsDropdown2Open(true)}
                onChange={(e) => {
                  setQuery2(e.target.value);
                  setSelectedShow2(null);
                  setIsDropdown2Open(true);
                }}
                className="w-full bg-transparent text-gray-200 placeholder:text-[#71717A] outline-none text-sm"
              />
              {selectedShow2 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShow2(null);
                    setQuery2("");
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 ml-2"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown 2 */}
            {isDropdown2Open && !selectedShow2 && query2.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-800 bg-[#141417] shadow-2xl z-50 divide-y divide-gray-800">
                {isSearching2 ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    Searching shows...
                  </div>
                ) : searchResults2.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    No shows found
                  </div>
                ) : (
                  searchResults2.map((show: ShowSearchItem) => (
                    <button
                      key={show.id}
                      type="button"
                      onClick={() => handleSelectShow2(show)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#202025] transition-colors"
                    >
                      {show.poster_url ? (
                        <Image
                          src={show.poster_url}
                          alt={show.title}
                          width={32}
                          height={48}
                          className="w-8 h-12 object-cover rounded bg-zinc-800 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-500 shrink-0">
                          N/A
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-sm font-medium text-white truncate">
                          {show.title}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {show.genres?.join(", ")}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            disabled={!selectedShow1 || !selectedShow2 || isComparing}
            onClick={handleCompare}
            className="bg-[#18181B] text-[#DC2626] font-semibold py-3 px-8 rounded-lg border border-[#DC2626] cursor-pointer transition-colors hover:bg-[#251214] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isComparing ? "Analyzing..." : "Compare"}
          </button>
          <button
            type="button"
            onClick={handleClearSearch}
            className="bg-[#18181B] text-[#A1A1AA] font-semibold py-3 px-8 rounded-lg border border-gray-700 cursor-pointer transition-colors hover:bg-[#23232a] hover:text-white"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Comparison Results Area */}
      {compareError && (
        <p className="mt-8 text-red-500 text-sm">
          Failed to retrieve matchup metrics.
        </p>
      )}

      {showA && showB && !isComparing && (
        <div className="w-full max-w-5xl mt-12 space-y-8 animate-in fade-in duration-300">
          {/* Battle Ratio Split Bar */}
          <div className="rounded-2xl border border-gray-800 bg-[#18181B] p-6">
            <div className="flex justify-between items-center text-sm font-bold mb-3">
              <span className="text-sky-400">
                {showA.title} ({showA.share_ratio}%)
              </span>
              <span className="text-rose-500">
                {showB.title} ({showB.share_ratio}%)
              </span>
            </div>

            <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${showA.share_ratio}%` }}
                className="bg-sky-500 transition-all duration-700 ease-out"
              />
              <div
                style={{ width: `${showB.share_ratio}%` }}
                className="bg-rose-500 transition-all duration-700 ease-out"
              />
            </div>
          </div>

          {/* Side-by-side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Left */}
            <div
              className={`rounded-2xl border ${showA.share_ratio >= showB.share_ratio ? "border-sky-500/50 bg-[#121824]" : "border-gray-800 bg-[#18181B]"} p-6 flex flex-col items-center text-center relative overflow-hidden`}
            >
              {showA.share_ratio >= showB.share_ratio && (
                <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Leading
                </span>
              )}
              {showA.poster_url && (
                <Image
                  src={showA.poster_url}
                  alt={showA.title}
                  width={140}
                  height={210}
                  className="rounded-lg object-cover mb-4 shadow-lg"
                />
              )}
              <h3 className="text-2xl font-bold text-white mb-2">
                {showA.title}
              </h3>
              <p className="text-3xl font-extrabold text-white">
                {showA.tweet_count_7d.toLocaleString()}{" "}
                <span className="text-sm font-normal text-[#A1A1AA]">
                  tweets / 7d
                </span>
              </p>
            </div>

            {/* Card Right */}
            <div
              className={`rounded-2xl border ${showB.share_ratio >= showA.share_ratio ? "border-rose-500/50 bg-[#241315]" : "border-gray-800 bg-[#18181B]"} p-6 flex flex-col items-center text-center relative overflow-hidden`}
            >
              {showB.share_ratio >= showA.share_ratio && (
                <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Leading
                </span>
              )}
              {showB.poster_url && (
                <Image
                  src={showB.poster_url}
                  alt={showB.title}
                  width={140}
                  height={210}
                  className="rounded-lg object-cover mb-4 shadow-lg"
                />
              )}
              <h3 className="text-2xl font-bold text-white mb-2">
                {showB.title}
              </h3>
              <p className="text-3xl font-extrabold text-white">
                {showB.tweet_count_7d.toLocaleString()}{" "}
                <span className="text-sm font-normal text-[#A1A1AA]">
                  tweets / 7d
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
