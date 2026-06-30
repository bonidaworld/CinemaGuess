# CinemaGuesser

CinemaGuesser is a small browser game where you see a frame from a movie and
guess when it appears on the movie timeline.

This repository is the current playable prototype. It uses Next.js, React, and
TypeScript.

## Prototype features

- Six-round single-player game
- Random frame selection without repeats during a game
- Timeline slider with one-second adjustments
- Server-side answer checking
- Score for each guess and a total game score
- Loading, error, round result, and final result screens
- Local movie metadata and frame images

## Run locally

Requirements:

- Node.js
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
npm run lint
npm run build
```

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd` instead:

```powershell
npm.cmd run dev
```

## Game loop

1. The browser requests a random round from `GET /api/round`.
2. The server returns the frame, movie details, and runtime without exposing
   the correct timestamp.
3. The player selects a moment on the movie timeline.
4. The browser sends the frame ID and normalized guess to `POST /api/guess`.
5. The server checks the answer and returns the real position, error, and score.
6. After six rounds, the game displays the total score.

## Local data model

The prototype uses TypeScript arrays instead of a database.

Movies are stored in [`data/movies.ts`](data/movies.ts):

```ts
type Movie = {
  id: string;
  title: string;
  year: number;
  runtimeSeconds: number;
};
```

Frames are stored in [`data/frames.ts`](data/frames.ts):

```ts
type Frame = {
  id: string;
  movieId: string;
  image: string;
  frameTimestampSeconds: number;
};
```

`Frame.movieId` links a frame to `Movie.id`.

## Add a movie

Add a unique record to the `movies` array in `data/movies.ts`:

```ts
{
  id: "7",
  title: "Example Movie",
  year: 2000,
  runtimeSeconds: 7200,
}
```

Use the full movie runtime in seconds. For example, two hours is `7200`
seconds.

## Add a frame

1. Put the image in `public/frames`.
2. Add a record to the `frames` array in `data/frames.ts`.
3. Set `movieId` to an existing movie ID.
4. Set `frameTimestampSeconds` to the frame's exact position in the movie.

Example:

```ts
{
  id: "frame-7",
  movieId: "7",
  image: "/frames/example-movie.jpg",
  frameTimestampSeconds: 1800,
}
```

Both movie IDs and frame IDs must be unique.

## Scoring

The browser sends the guess as a value from `0` to `1`:

- `0` means the start of the movie.
- `0.5` means the middle.
- `1` means the end.

The server converts the real frame timestamp to the same range and measures
the distance between the two values. The scoring curve in
[`lib/scoring.ts`](lib/scoring.ts) awards up to `1000` points:

- An exact answer gives `1000` points.
- A nearby answer gives fewer points based on an exponential curve.
- The worst possible answer gives `0` points.

## Current limitations

- All movie and frame data is stored locally in source files.
- There is no database yet.
- There are no real server-side game sessions.
- Scores are not persisted and there is no leaderboard.
- Images are stored locally in `public/frames`.
- Content rights and licensing for movie frames are not solved yet. Treat the
  current content as prototype material, not as cleared content for a public
  product.
