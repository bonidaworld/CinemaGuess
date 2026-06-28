import { frames } from "@/data/frames";
import { movies } from "@/data/movies";

export const dynamic = "force-dynamic";

// Route Handlers run on the server, so the hidden timestamp stays here.
export async function GET() {
  const randomIndex = Math.floor(Math.random() * frames.length);
  const frame = frames[randomIndex];

  if (!frame) {
    return Response.json({ error: "No frames available" }, { status: 500 });
  }

  const movie = movies.find((item) => item.id === frame.movieId);

  if (!movie) {
    return Response.json(
      { error: "Movie for frame not found" },
      { status: 500 },
    );
  }

  return Response.json(
    {
      frameId: frame.id,
      movieTitle: movie.title,
      year: movie.year,
      runtimeSeconds: movie.runtimeSeconds,
      image: frame.image,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
