# CinemaGuesser database draft

This directory describes a future PostgreSQL/Supabase data model for
CinemaGuesser. It is a draft only:

- The schema has not been applied to a Supabase project.
- No migrations have been generated.
- Supabase is not connected to the application.
- The running game still reads the local TypeScript files in `data/`.

## Tables

### `movies`

Stores canonical movie metadata:

- title
- release year
- full runtime in seconds

One movie can have many playable frames.

### `frames`

Stores each playable still image and links it to a movie through `movie_id`.
It also records:

- the image location
- the frame timestamp in seconds
- whether the frame is active
- optional source and rights information

Keeping frames separate from movies avoids repeating the title, year, and
runtime for every image. It also allows many frames to belong to one movie and
lets individual frames be enabled or disabled.

### `game_sessions`

Represents one complete playthrough. It tracks whether the game is active,
finished, or abandoned and stores the accumulated score.

There is no user reference yet because authentication is intentionally outside
the scope of this draft.

### `session_rounds`

Records the ordered rounds generated for a game session. Each row links one
session to one frame and stores its round number.

The uniqueness rules prevent a session from using the same round number or
frame twice. This moves round selection from temporary browser state toward a
server-controlled game session.

### `guesses`

Stores the single accepted answer for a session round:

- the player's normalized position from `0` to `1`
- the correct normalized position
- the error percentage
- the awarded score

Persisting guesses makes game history, score validation, analytics, and a
future leaderboard possible.

## Mapping the current local data

The current prototype remains the source used by the running application.
Later, its data can map to PostgreSQL as follows:

| Current field | Future database field |
|---|---|
| `data/movies.ts` → `Movie.id` | Replaced by generated `movies.id` UUID |
| `Movie.title` | `movies.title` |
| `Movie.year` | `movies.year` |
| `Movie.runtimeSeconds` | `movies.runtime_seconds` |
| `data/frames.ts` → `Frame.id` | Replaced by generated `frames.id` UUID |
| `Frame.movieId` | Mapped to `frames.movie_id` |
| `Frame.image` | `frames.image_url` |
| `Frame.frameTimestampSeconds` | `frames.frame_timestamp_seconds` |

The existing string IDs would need a one-time mapping to the generated movie
and frame UUIDs during a future import.

## What remains local

After adding this draft, all current behavior remains local:

- Movie and frame records still come from `data/movies.ts` and
  `data/frames.ts`.
- Frame images still come from `public/frames`.
- Round and score state still lives in the browser during a game.
- API routes still use the local TypeScript arrays.
- There is still no authentication, persistent session, or leaderboard.

## Later implementation steps

When the draft has been reviewed, the next database step is to turn it into an
initial migration and apply that migration to a development Supabase project.
After that, a one-time import can copy the local movies and frames into the new
tables.

Connecting the application and API routes should happen separately, after the
schema and imported data have been verified.
