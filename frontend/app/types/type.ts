
export interface Show {
    id: number;
    title: string;
    slug: string;
    poster_url: string | null;
    genres: string[];
    first_air_date: string | null;
}


export interface LeaderboardItem {
    rank: number;
    rank_change: number;
    tweet_count_7d: number;
    show: Show;
}

export interface LeaderboardRequestParams {
    genre?: string;
    limit?: number;
    offset?: number;
}

export interface LeaderboardResponse {
    data: LeaderboardItem[];
    date: string;
    total: number;
}

export interface ShowSearchRequestParams {
    q: string;
    limit?: number;
}

export type ShowSearchResponse = Show[];

export interface AreanShow {
    id : string;
    title: string;
    slug: string;
    poster_url: string | null;
    tweet_count_7d: number;
    share_ratio : number;
}

export interface ArenaResponse {
    shows : AreanShow[];
}

export interface ShowSearchItem {
    id: number;
    title: string;
    slug: string;
    poster_url: string | null;
    genres: string[];
    first_air_date: string | null;
}

export interface RevealedShow {
    id: number;
    title: string;
    poster_url : string | null;
    tweet_count_7d: number;
}

export interface ChallengeShow {
    id: number;
    title: string;
    poster_url : string | null;
}

export interface GameRoundResponse {
    revealed_show : RevealedShow;
    challenger_show : ChallengeShow;
}

export interface GameVerifyRequest {
    revealed_show_id : string;
    challenger_show_id : string;
    guess : "higher" | "lower";
}

export interface GameVerifyResponse {
    correct: boolean;
    revealed_count: number;
    challenger_count: number;
}