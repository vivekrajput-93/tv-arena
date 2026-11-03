import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ArenaResponse,
  GameRoundResponse,
  GameVerifyRequest,
  GameVerifyResponse,
  LeaderboardRequestParams,
  LeaderboardResponse,
  ShowSearchRequestParams,
  ShowSearchResponse,
} from "../types/type";

export const apiSlce = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  }),
  tagTypes: ["Leaderboard"],
  endpoints: (builder) => ({
    getLeaderboard: builder.query<
      LeaderboardResponse,
      LeaderboardRequestParams | undefined
    >({
      query: (params) => {
        const { genre, limit, offset } = params || {};
        const queryParams = new URLSearchParams();
        if (genre) queryParams.append("genre", genre);
        if (limit) queryParams.append("limit", limit.toString());
        if (offset) queryParams.append("offset", offset.toString());
        return `/leaderboard?${queryParams}`;
      },
    }),
    searchShows: builder.query<ShowSearchResponse, ShowSearchRequestParams>({
      query: ({ q, limit = 10 }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("q", q);
        queryParams.append("limit", limit.toString());
        return `/shows/search?${queryParams.toString()}`;
      },
    }),

    compareShows: builder.query<ArenaResponse, string[]>({
      query: (showSlugs) => {
        const slugs = showSlugs.join(",");
        return `/arena/compare?slugs=${encodeURIComponent(slugs)}`;
      },
    }),

    getGameRound: builder.query<GameRoundResponse, void>({
      query: () => {
        return `/game/round`;
      },
    }),

    verifyGameGuess: builder.mutation<GameVerifyResponse, GameVerifyRequest>({
      query: (body) => ({
        url: "/game/verify",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetLeaderboardQuery,
  useSearchShowsQuery,
  useLazySearchShowsQuery,
  useCompareShowsQuery,
  useGetGameRoundQuery,
  useLazyGetGameRoundQuery,
  useVerifyGameGuessMutation,
} = apiSlce;
