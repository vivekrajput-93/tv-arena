import { useMemo, useState } from "react";
import { LEADERBOARD_LABEL } from "../libs/helper";
import { useGetLeaderboardQuery, useSearchShowsQuery } from "../hooks/apiSlice";
import Image from "next/image";
import LeaderboardSkeleton from "../components/Skeletion";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

type LeaderboardPageProps = {
  onCompareClick?: () => void;
};

export default function LeaderboardPage({ onCompareClick }: LeaderboardPageProps) {
  const [tab, setTab] = useState("All Shows");
  const [page, setPage] = useState(1);
  const limit = 15;
  const searchQuery = useSelector((state: RootState) => state.search.query);
  const normalizedSearchQuery = (searchQuery ?? "").trim();
  const hasActiveSearch = normalizedSearchQuery.length > 0;

  const { data, isLoading, isFetching, error } = useGetLeaderboardQuery({
    genre: tab === "All Shows" ? undefined : tab,
    limit,
    offset: (page - 1) * limit,
  });

  const {
    data: searchedShows,
    isFetching: isSearchFetching,
    error: searchError,
  } = useSearchShowsQuery(
    {
      q: normalizedSearchQuery,
      limit: 100,
    },
    {
      skip: !hasActiveSearch,
    },
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const visiblePages = useMemo(() => {
    const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
    return Array.from(pages)
      .filter((currentPage) => currentPage >= 1 && currentPage <= totalPages)
      .sort((firstPage, secondPage) => firstPage - secondPage);
  }, [page, totalPages]);

  const renderRankChange = (rankChange: number) => {
    if (rankChange > 0) {
      return <span className="text-green-500">+{rankChange}</span>;
    } else if (rankChange < 0) {
      return <span className="text-red-500">{rankChange}</span>;
    } else {
      return <span className="text-gray-400">0</span>;
    }
  };

  const selectedGenre = tab === "All Shows" ? "All" : tab;

  const searchableShowIds = useMemo(() => {
    return new Set((searchedShows ?? []).map((show) => show.id));
  }, [searchedShows]);

  const filteredItems = useMemo(() => {
    const items = data?.data ?? [];
    if (!hasActiveSearch) {
      return items;
    }
    return items.filter((item) => searchableShowIds.has(item.show.id));
  }, [data?.data, hasActiveSearch, searchableShowIds]);

  return (
    <div>
      <section className="p-8">
        <h1 className="text-6xl font-bold text-white mb-4">
          Trending TV Shows on X
        </h1>
        <p className="text-xl font-semibold te">
          Live rankings updated daily based on rolling 7-day conversational
          tweet volume.
        </p>

        <section className="flex flex-row gap-6 mt-10 flex-wrap">
          {LEADERBOARD_LABEL.map((label, index) => (
            <div
              key={index}
              onClick={() => {
                setTab(label);
                setPage(1);
              }}
              className="transition duration-300 ease-in-out hover:scale-105"
            >
              <span
                className={`text-lg font-semibold py-4 px-6 rounded-full border border-gray-800 cursor-pointer ${tab === label ? "text-black bg-[#DC2626] cursor-pointer" : "text-[#A1A1AA] bg-[#18181B]"}`}
              >
                {label}
              </span>
            </div>
          ))}
        </section>
        <section className="mt-10">
          {isLoading || isFetching || isSearchFetching ? (
            <LeaderboardSkeleton rows={15} />
          ) : error || searchError ? (
            <div className="text-red-500">Error fetching leaderboard data</div>
          ) : (
            <table className="w-full text-left border-collapse rounded-2xl bg-[#18181B]">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-4 px-6 text-gray-400">Rank</th>
                  <th className="py-4 px-6 text-gray-400">Show</th>
                  <th className="py-4 px-6 text-gray-400">Genre</th>
                  <th className="py-4 px-6 text-gray-400">Tweet Volume</th>
                  <th className="py-4 px-6 text-gray-400">Rank Change</th>
                  <th className="py-4 px-6 text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 px-6 text-center text-[#A1A1AA]"
                    >
                      No shows found for ‘{normalizedSearchQuery}’.
                    </td>
                  </tr>
                ) : null}
                {filteredItems.map((item, index) => (
                  <tr
                    key={item.rank}
                    className={`border-b border-gray-800 h-24`}
                  >
                    <td className="py-4 px-6 text-white">{index + 1}</td>
                    <td className="py-4 px-6 text-white flex items-center">
                      {item.show.poster_url ? (
                        <Image
                          src={item.show.poster_url}
                          alt={item.show.title || "Show poster"}
                          width={50}
                          height={75}
                          className="w-20 h-30 object-cover rounded bg-zinc-800 flex-wrap"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-zinc-800 rounded flex items-center justify-center text-zinc-500 text-xs">
                          N/A
                        </div>
                      )}
                      <div className="ml-4 text-xl font-bold">
                        {item.show.title}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#A1A1AA]">
                      <div className="flex flex-wrap gap-2">
                        {(selectedGenre === "All"
                          ? item.show.genres
                          : item.show.genres.filter(
                              (g) =>
                                g.toLowerCase() === selectedGenre.toLowerCase(),
                            )
                        ).map((genre) => (
                          <span
                            key={genre}
                            className="px-4 py-2 bg-[#36363f] rounded-2xl text-sm whitespace-nowrap text-wrap"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white text-2xl font-bold">
                      {item?.tweet_count_7d?.toLocaleString()}{" "}
                      <span className="text-sm font-normal">tweets</span>
                    </td>
                    <td className="py-4 px-6">
                      {renderRankChange(item?.rank_change)}
                    </td>
                    <td className="py-4 px-6 text-white">
                      <button
                        type="button"
                        onClick={onCompareClick}
                        className="bg-[#18181B] text-[#DC2626] py-3 px-8 rounded-lg border border-[#DC2626] cursor-pointer"
                      >
                        Compare
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading &&
          !isFetching &&
          !isSearchFetching &&
          !error &&
          !searchError &&
          !hasActiveSearch &&
          totalPages > 1 ? (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (canGoPrevious) {
                          setPage((previousPage) => previousPage - 1);
                        }
                      }}
                      className={
                        !canGoPrevious ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {visiblePages.map((currentPage, pageIndex) => {
                    const previousVisiblePage = visiblePages[pageIndex - 1];
                    const shouldShowEllipsis =
                      pageIndex > 0 && currentPage - previousVisiblePage > 1;

                    return (
                      <div key={currentPage} className="contents">
                        {shouldShowEllipsis ? (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : null}

                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(event) => {
                              event.preventDefault();
                              setPage(currentPage);
                            }}
                          >
                            {currentPage}
                          </PaginationLink>
                        </PaginationItem>
                      </div>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (canGoNext) {
                          setPage((previousPage) => previousPage + 1);
                        }
                      }}
                      className={
                        !canGoNext ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </section>
      </section>
    </div>
  );
}
