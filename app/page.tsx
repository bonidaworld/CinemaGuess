import Image from "next/image";
import { movies } from "@/data/movies";

export default function Home() {
  const movie = movies[0];

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="flex w-full max-w-4xl flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          CinemaGuesser
        </h1>

        <p className="mt-4 text-base text-zinc-400 sm:text-lg">
          Guess where the movie frame appears on the timeline.
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

        <div className="mt-8 h-1 w-full rounded-full bg-zinc-700" />

        <button
          type="button"
          disabled
          className="mt-10 cursor-not-allowed rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium text-zinc-500"
        >
          Game coming next
        </button>

        <p className="mt-12 text-sm text-zinc-600">Step 1: static layout</p>
      </div>
    </main>
  );
}
