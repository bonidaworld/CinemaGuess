-- CinemaGuesser PostgreSQL schema draft.
-- This file documents the planned data model only. It has not been applied to
-- a Supabase project and is not used by the application yet.

create extension if not exists pgcrypto;

-- Stores canonical movie metadata shared by all frames from the same movie.
create table movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year integer not null,
  runtime_seconds integer not null,
  created_at timestamptz default now(),

  constraint movies_runtime_seconds_positive check (runtime_seconds > 0),
  constraint movies_year_valid check (year > 1800)
);

comment on table movies is
  'Canonical movie metadata used to calculate frame positions and display movie details.';

-- Stores playable still images and their exact timestamps within a movie.
-- Source and rights fields provide a place to track content provenance.
create table frames (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references movies(id) on delete cascade,
  image_url text not null,
  frame_timestamp_seconds integer not null,
  source_name text,
  source_url text,
  rights_note text,
  is_active boolean not null default true,
  created_at timestamptz default now(),

  constraint frames_timestamp_positive check (frame_timestamp_seconds > 0)
);

comment on table frames is
  'Playable movie frames, their timestamps, publication state, and content provenance.';

create index frames_movie_id_idx on frames (movie_id);
create index frames_is_active_idx on frames (is_active);

-- Stores one playthrough and its lifecycle and accumulated score.
create table game_sessions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'active',
  total_score integer not null default 0,
  created_at timestamptz default now(),
  finished_at timestamptz,

  constraint game_sessions_status_valid
    check (status in ('active', 'finished', 'abandoned')),
  constraint game_sessions_total_score_nonnegative check (total_score >= 0)
);

comment on table game_sessions is
  'One game playthrough, including its current status and total score.';

-- Records which frame was assigned to each numbered round in a session.
-- The unique constraints prevent duplicate round numbers and repeated frames.
create table session_rounds (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references game_sessions(id) on delete cascade,
  frame_id uuid not null references frames(id),
  round_number integer not null,
  created_at timestamptz default now(),

  constraint session_rounds_number_positive check (round_number > 0),
  constraint session_rounds_session_number_unique
    unique (session_id, round_number),
  constraint session_rounds_session_frame_unique unique (session_id, frame_id)
);

comment on table session_rounds is
  'The ordered frames assigned to the rounds of a specific game session.';

create index session_rounds_session_id_idx on session_rounds (session_id);
create index session_rounds_frame_id_idx on session_rounds (frame_id);

-- Stores the submitted answer and server-calculated result for one round.
-- A round can have at most one accepted guess.
create table guesses (
  id uuid primary key default gen_random_uuid(),
  session_round_id uuid not null references session_rounds(id) on delete cascade,
  guessed_position numeric not null,
  actual_position numeric not null,
  error_percent numeric not null,
  score integer not null,
  created_at timestamptz default now(),

  constraint guesses_position_valid check (
    guessed_position between 0 and 1
  ),
  constraint guesses_actual_position_valid check (
    actual_position between 0 and 1
  ),
  constraint guesses_error_percent_nonnegative check (error_percent >= 0),
  constraint guesses_score_nonnegative check (score >= 0),
  constraint guesses_session_round_unique unique (session_round_id)
);

comment on table guesses is
  'One submitted guess per session round, including the calculated error and score.';

create index guesses_session_round_id_idx on guesses (session_round_id);
create index guesses_score_idx on guesses (score);
