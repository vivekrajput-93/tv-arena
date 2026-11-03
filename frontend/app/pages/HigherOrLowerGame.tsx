import { useState } from "react";
import {
  useGetGameRoundQuery,
  useLazyGetGameRoundQuery,
  useVerifyGameGuessMutation,
} from "../hooks/apiSlice";
import Image from "next/image";
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";

export default function HigherOrLowerGame() {
  const [score, setScore] = useState(0);
  const [highScore, setHighscore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [revealChallengerCount, setRevealChallengerCount] = useState<
    number | null
  >(null);

  const { data: initialRound, isLoading } = useGetGameRoundQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [triggerNewRound, { isFetching: isFetchingNewRound }] =
    useLazyGetGameRoundQuery();
  const [verifyGuess, { isLoading: isVerifyingGuess }] =
    useVerifyGameGuessMutation();

  const [currentRound, setCurrentRound] = useState(initialRound);
  const activeRound = currentRound || initialRound;

  const handleGuess = async (guess: "higher" | "lower") => {
    if (!activeRound || isVerifyingGuess || isGameOver) return;

    try {
      const response = await verifyGuess({
        revealed_show_id: String(activeRound.revealed_show.id),
        challenger_show_id: String(activeRound.challenger_show.id),
        guess,
      }).unwrap();

      setRevealChallengerCount(response.challenger_count);

      if (response.correct) {
        const nextScore = score + 1;
        setScore(nextScore);
        if (nextScore > highScore) {
          setHighscore(nextScore);
        }

        setTimeout(async () => {
          const next = await triggerNewRound().unwrap();
          setCurrentRound(next);
          setRevealChallengerCount(null);
        }, 1000);
      } else {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1000);
      }
    } catch (error) {
      console.error("Error verifying guess:", error);
    }
  };

  const handleRestart = async () => {
    setScore(0);
    setIsGameOver(false);
    setRevealChallengerCount(null);
    const freshRound = await triggerNewRound().unwrap();
    setCurrentRound(freshRound);
  };

  if (isLoading || !activeRound) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-white">
        Loading...
      </div>
    );
  }

  const { revealed_show, challenger_show } = activeRound;

  return (
    <div className="flex flex-col min-h-[70vh] px-6 text-center mt-8">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
        Which show got more tweets this week?
      </h1>

      <div className="flex p-3 items-center justify-center gap-4 sm:gap-9 mb-4">
        <div className="w-48 sm:w-60 h-24 border border-gray-700 p-2 flex flex-col gap-2 bg-[#18181B] rounded-2xl">
          <h1 className="text-xl font-bold text-[#A1A1AA]">CURRENT STREAK</h1>
          <span className="text-3xl font-bold text-[#DC2626]">{score}</span>
        </div>
        <div className="w-48 sm:w-60 h-24 border border-gray-700 p-2 flex flex-col gap-2 bg-[#18181B] rounded-2xl">
          <h1 className="text-xl font-bold text-[#A1A1AA]">HIGH SCORE</h1>
          <span className="text-3xl font-bold">{highScore}</span>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-8">
        <div className="flex flex-col items-center justify-between rounded-2xl border border-zinc-800 bg-[#1c1c20] p-6 text-center shadow-xl min-h-130">
          <div className="w-full flex justify-center mb-4">
            {revealed_show.poster_url ? (
              <Image
                src={revealed_show.poster_url}
                alt={revealed_show.title}
                width={200}
                height={300}
                className="h-62.5 w-42.5 object-cover rounded-lg"
              />
            ) : (
              <div className="h-62.5 w-42.5 rounded-lg bg-linear-to-b from-zinc-600 to-zinc-800 flex items-end justify-start p-4">
                <span className="text-white text-4xl font-extrabold">
                  {revealed_show.title.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h2 className="text-4xl font-bold line-clamp-1 mb-4">
            {revealed_show.title}
          </h2>
          <div className="bg-[#0f0f12] border border-zinc-800 rounded-xl px-6 py-5 w-full">
            <span className="text-6xl font-extrabold text-white leading-none block">
              {revealed_show.tweet_count_7d.toLocaleString()}
            </span>
            <span className="text-2xl text-zinc-400 block mt-2">
              tweets in the last 7 days
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#EF4444] bg-[#121216] text-[#EF4444] text-3xl font-bold shadow-2xl">
          VS
        </div>

        <div className="flex flex-col items-center justify-between rounded-2xl border border-zinc-800 bg-[#1c1c20] p-6 text-center shadow-xl relative overflow-hidden min-h-130">
          <div className="w-full flex justify-center mb-4">
            {challenger_show?.poster_url ? (
              <Image
                src={challenger_show.poster_url}
                alt={challenger_show.title}
                width={200}
                height={300}
                className="h-62.5 w-42.5 object-cover rounded-lg"
              />
            ) : (
              <div className="h-62.5 w-42.5 rounded-lg bg-linear-to-b from-red-500 to-zinc-800 flex items-end justify-start p-4">
                <span className="text-white text-4xl font-extrabold">
                  {challenger_show.title.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h2 className="text-4xl font-bold line-clamp-1 mb-4">
            {challenger_show?.title}
          </h2>
          {isGameOver ? (
            <div className="w-full bg-red-950/40 border border-red-900/60 rounded-xl p-4 animate-in fade-in">
              <p className="text-red-400 font-bold text-lg mb-1">Game Over</p>
              <p className="text-xs text-zinc-400 mb-3">
                {challenger_show.title} had{" "}
                <span className="text-white font-semibold">
                  {revealChallengerCount?.toLocaleString()}
                </span>{" "}
                tweets in the last 7 days
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          ) : revealChallengerCount !== null ? (
            <div className="bg-[#0f0f12] border border-zinc-800 rounded-xl px-6 py-5 w-full animate-in zoom-in-95">
              <span className="text-6xl font-extrabold text-white leading-none block">
                {revealChallengerCount?.toLocaleString()}
              </span>
              <span className="text-2xl text-zinc-400 block mt-2">
                tweets in the last 7 days
              </span>
            </div>
          ) : (
            <div className="bg-[#0f0f12] border border-zinc-800 rounded-xl px-6 py-8 w-full animate-in fade-in">
              <span className="text-7xl font-extrabold text-[#EF4444] leading-none blur-[1px]">
                ?
              </span>
              <span className="text-2xl text-zinc-400 block mt-2">
                tweets in the last 7 days
              </span>
            </div>
          )}
        </div>
      </div>

      {!isGameOver && revealChallengerCount === null ? (
        <div className="w-full mt-8 flex justify-center">
          <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              disabled={isVerifyingGuess || isFetchingNewRound}
              onClick={() => handleGuess("higher")}
              className="w-full h-16 flex items-center justify-center gap-2 rounded-2xl bg-[#EF4444] hover:bg-[#F43F3F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xl tracking-wide transition-all shadow-lg shadow-red-900/30 cursor-pointer"
            >
              HIGHER <ArrowUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={isVerifyingGuess || isFetchingNewRound}
              onClick={() => handleGuess("lower")}
              className="w-full h-16 flex items-center justify-center gap-2 rounded-2xl border-2 border-[#EF4444] text-[#EF4444] bg-transparent hover:bg-[#2a1212] disabled:opacity-50 disabled:cursor-not-allowed font-extrabold text-xl tracking-wide transition-all cursor-pointer"
            >
              LOWER <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
