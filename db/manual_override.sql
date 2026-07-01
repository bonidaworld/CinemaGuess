INSERT INTO imdb.movie_key_overrides (movie_key, tconst, note)
VALUES
    -- ('dune:2021', 'tt1160419', 'Dune = Dune: Part One')
ON CONFLICT (movie_key) DO UPDATE
SET
    tconst = EXCLUDED.tconst,
    note = EXCLUDED.note,
    updated_at = now();