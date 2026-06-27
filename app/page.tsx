"use client";

import Image from "next/image";
import { useState } from "react";
import { movies } from "@/data/movies";

type GameScreen = "menu" | "game" | "results";

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

function calculateRoundResult(
  targetSeconds: number,
  guessedSeconds: number,
  runtimeSeconds: number,
) {
  const differenceSeconds = Math.abs(guessedSeconds - targetSeconds);

  const maxPossibleDifference = Math.max(
    targetSeconds,
    runtimeSeconds - targetSeconds,
  );

  const normalizedError = Math.min(
    differenceSeconds / maxPossibleDifference,
    1,
  );

  const steepness = 3;

  const scoreMultiplier =
    (Math.exp(-steepness * normalizedError) - Math.exp(-steepness)) /
    (1 - Math.exp(-steepness));

  const roundScore = Math.round(1000 * Math.max(0, scoreMultiplier));

  return { differenceSeconds, roundScore };
}

export default function Home() {
  const [movieIndex, setMovieIndex] = useState(0);
  const [guessedTimestampSeconds, setGuessedTimestampSeconds] = useState(
    Math.round((movies[0]?.runtimeSeconds ?? 0) / 2),
  );
  const [isResultShown, setIsResultShown] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [screen, setScreen] = useState<GameScreen>("menu");

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

  const { differenceSeconds, roundScore } = calculateRoundResult(
    movie.frameTimestampSeconds,
    guessedTimestampSeconds,
    movie.runtimeSeconds,
  );

  function handleCheckGuess() {
    if (isResultShown) {
      return;
    }

    setSessionScore((currentScore) => currentScore + roundScore);
    setIsResultShown(true);
  }

  function handleAdjustGuess(seconds: number) {
    setGuessedTimestampSeconds((currentTimestamp) =>
      Math.min(movie.runtimeSeconds, Math.max(0, currentTimestamp + seconds)),
    );
  }

  function handleNextMovie() {
    if (movieIndex === movies.length - 1) {
      setScreen("results");
      return;
    }

    const nextMovieIndex = movieIndex + 1;
    const nextMovie = movies[nextMovieIndex];

    setMovieIndex(nextMovieIndex);
    setGuessedTimestampSeconds(Math.round(nextMovie.runtimeSeconds / 2));
    setIsResultShown(false);
  }

  function handleStartGame() {
    setMovieIndex(0);
    setGuessedTimestampSeconds(
      Math.round((movies[0]?.runtimeSeconds ?? 0) / 2),
    );
    setIsResultShown(false);
    setSessionScore(0);
    setScreen("game");
  }

  function handleReturnToMenu() {
    setScreen("menu");
  }

  if (screen === "menu") {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-6 py-10 text-zinc-100">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            CinemaGuesser
          </h1>
          <p className="mt-5 text-zinc-400">
            Угадайте, на какой минуте фильма сделан этот кадр.
          </p>
          <button
            type="button"
            onClick={handleStartGame}
            className="mt-10 rounded-lg bg-amber-400 px-8 py-3 font-medium text-zinc-950 transition hover:bg-amber-300"
          >
            Играть
          </button>
        </div>
      </main>
    );
  }

  if (screen === "results") {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-6 py-10 text-zinc-100">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <p className="text-sm font-medium text-amber-400">Игра завершена</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            CinemaGuesser
          </h1>
          <p className="mt-10 text-zinc-400">Набрано очков</p>
          <p className="mt-3 text-6xl font-bold text-emerald-400">
            {sessionScore}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleStartGame}
              className="rounded-lg bg-amber-400 px-6 py-3 font-medium text-zinc-950 transition hover:bg-amber-300"
            >
              Начать игру заново
            </button>
            <button
              type="button"
              onClick={handleReturnToMenu}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-3 font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              Вернуться в главное меню
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="flex w-full max-w-4xl flex-col items-center text-center">
        <div className="mb-3 flex items-center gap-6 text-sm font-medium">
          <p className="text-amber-400">
            Раунд {movieIndex + 1} / {movies.length}
          </p>
          <p className="text-zinc-400">Общий счёт: {sessionScore}</p>
        </div>

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

        <p className="mt-4 text-zinc-500">
          {movie.title} ({movie.year})
        </p>

        <div className="mt-8 w-full">
          <div className="mb-3 flex justify-between text-xs text-zinc-500">
            <span>0:00</span>
            <span>{formatTime(movie.runtimeSeconds)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAdjustGuess(-1)}
              disabled={isResultShown || guessedTimestampSeconds === 0}
              className="h-10 w-10 shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 text-lg text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Сдвинуть выбор на одну секунду назад"
              title="На секунду назад"
            >
              ←
            </button>

            <input
              type="range"
              min="0"
              max={movie.runtimeSeconds}
              step="1"
              value={guessedTimestampSeconds}
              disabled={isResultShown}
              onChange={(event) =>
                setGuessedTimestampSeconds(Number(event.target.value))
              }
              className="min-w-0 flex-1 cursor-pointer accent-amber-400 disabled:cursor-not-allowed"
              aria-label="Выбор момента на таймлайне фильма"
            />

            <button
              type="button"
              onClick={() => handleAdjustGuess(1)}
              disabled={
                isResultShown ||
                guessedTimestampSeconds === movie.runtimeSeconds
              }
              className="h-10 w-10 shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 text-lg text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Сдвинуть выбор на одну секунду вперёд"
              title="На секунду вперёд"
            >
              →
            </button>
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
            {differenceSeconds === 0 ? (
              <p className="text-lg font-semibold text-emerald-400">
                HEADSHOT
              </p>
            ) : (
              <p className="text-lg font-semibold text-zinc-100">
                Ошиблись на: {formatTime(differenceSeconds)}
              </p>
            )}
            <p className="mt-2 text-sm text-zinc-400">
              Счёт: {roundScore}
            </p>
          </div>
        ) : (
          <p className="mt-8 text-sm text-zinc-500">
            Передвинь маркер туда, где, по твоему мнению, находится этот кадр.
          </p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {isResultShown ? (
            <button
              type="button"
              onClick={handleNextMovie}
              className="rounded-lg bg-amber-400 px-6 py-3 font-medium text-zinc-950 transition hover:bg-amber-300"
            >
              {movieIndex === movies.length - 1
                ? "Завершить игру"
                : "Следующий фильм"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCheckGuess}
              className="rounded-lg bg-amber-400 px-6 py-3 font-medium text-zinc-950 transition hover:bg-amber-300"
            >
              Ответить
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
