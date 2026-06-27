"use client";

import Image from "next/image";
import { useState } from "react";
import { movies } from "@/data/movies";

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getTimelinePercent(timestampSeconds: number, runtimeSeconds: number) {
  if (runtimeSeconds <= 0) {
    return 0;
  }

  const percent = (timestampSeconds / runtimeSeconds) * 100;

  return Math.min(100, Math.max(0, percent));
}

export default function Home() {
  const [movieIndex, setMovieIndex] = useState(0);
  const [guessPercent, setGuessPercent] = useState(50);
  const [isResultShown, setIsResultShown] = useState(false);

  const movie = movies[movieIndex];

  if (!movie) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-6 text-zinc-100">
        <p className="text-center text-zinc-400">
          Добавь хотя бы один фильм в data/movies.ts.
        </p>
      </main>
    );
  }

  const correctPercent = getTimelinePercent(
    movie.frameTimestampSeconds,
    movie.runtimeSeconds,
  );
  const guessedTimestampSeconds = Math.round(
    (movie.runtimeSeconds * guessPercent) / 100,
  );
  const differenceSeconds = Math.abs(
    guessedTimestampSeconds - movie.frameTimestampSeconds,
  );
  const score = Math.max(
    0,
    Math.round(100 - (differenceSeconds / movie.runtimeSeconds) * 100),
  );

  function handleCheckGuess() {
    setIsResultShown(true);
  }

  function handleNextMovie() {
    setMovieIndex((currentIndex) => (currentIndex + 1) % movies.length);
    setGuessPercent(50);
    setIsResultShown(false);
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="flex w-full max-w-4xl flex-col items-center text-center">
        <p className="mb-3 text-sm font-medium text-amber-400">
          Movie {movieIndex + 1} / {movies.length}
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          CinemaGuesser
        </h1>

        <p className="mt-4 text-base text-zinc-400 sm:text-lg">
          Угадайте, на какой минуте фильма сделан этот кадр.
        </p>

        <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
          <Image
            src={movie.frameImage}
            alt={`Frame from ${movie.title}`}
            fill
            priority
            className="object-contain"
          />
        </div>

        <p className="mt-4 text-sm text-zinc-500">
          {movie.title} ({movie.year})
        </p>

        <div className="mt-8 w-full">
          <div className="mb-3 flex justify-between text-xs text-zinc-500">
            <span>0:00</span>
            <span>{formatTime(movie.runtimeSeconds)}</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={guessPercent}
            disabled={isResultShown}
            onChange={(event) => setGuessPercent(Number(event.target.value))}
            className="w-full cursor-pointer accent-amber-400 disabled:cursor-not-allowed"
            aria-label="Guess frame position on movie timeline"
          />

          <div className="relative mt-5 h-3 w-full rounded-full bg-zinc-800">
            <div
              className="h-3 rounded-full bg-amber-400"
              style={{ width: `${guessPercent}%` }}
            />

            <div
              className="absolute top-1/2 h-6 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200"
              style={{ left: `${guessPercent}%` }}
              aria-hidden="true"
            />

            {isResultShown && (
              <div
                className="absolute top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400"
                style={{ left: `${correctPercent}%` }}
                aria-hidden="true"
              />
            )}
          </div>

          <div className="mt-3 flex justify-center gap-6 text-xs text-zinc-500">
            <span>
              Твой выбор: {formatTime(guessedTimestampSeconds)}
            </span>

            {isResultShown && (
              <span className="text-emerald-400">
                Верно: {formatTime(movie.frameTimestampSeconds)}
              </span>
            )}
          </div>
        </div>

        {isResultShown ? (
          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-5">
            <p className="text-lg font-semibold text-zinc-100">
              Ошибка: {formatTime(differenceSeconds)}
            </p>
            <p className="mt-2 text-sm text-zinc-400">Score: {score} / 100</p>
          </div>
        ) : (
          <p className="mt-8 text-sm text-zinc-500">
            Передвинь маркер туда, где, по твоему мнению, находится этот кадр.
          </p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleCheckGuess}
            disabled={isResultShown}
            className="rounded-lg bg-amber-400 px-6 py-3 font-medium text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            Check guess
          </button>

          <button
            type="button"
            onClick={handleNextMovie}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-3 font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            Next movie
          </button>
        </div>
      </div>
    </main>
  );
}
