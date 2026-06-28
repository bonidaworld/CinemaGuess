import { frames } from "@/data/frames";
import { movies } from "@/data/movies";
import { calculateScore } from "@/lib/scoring";

type GuessRequest = {
  frameId: string;
  guess: number;
};

// This POST handler checks the answer on the server.
export async function POST(request: Request) {
  let body: GuessRequest;

  try {
    body = (await request.json()) as GuessRequest;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body.frameId !== "string" ||
    typeof body.guess !== "number" ||
    !Number.isFinite(body.guess) ||
    body.guess < 0 ||
    body.guess > 1
  ) {
    return Response.json(
      { error: "frameId and a guess from 0 to 1 are required" },
      { status: 400 },
    );
  }

  const frame = frames.find((item) => item.id === body.frameId);

  if (!frame) {
    return Response.json({ error: "Frame not found" }, { status: 404 });
  }

  const movie = movies.find((item) => item.id === frame.movieId);

  if (!movie) {
    return Response.json(
      { error: "Movie for frame not found" },
      { status: 500 },
    );
  }

  const actualPosition =
    frame.frameTimestampSeconds / movie.runtimeSeconds;
  const errorPercent = Math.abs(body.guess - actualPosition) * 100;
  const score = calculateScore(body.guess, actualPosition);

  return Response.json({
    guess: body.guess,
    actualPosition,
    errorPercent,
    score,
  });
}
