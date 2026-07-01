CREATE OR REPLACE FUNCTION imdb.apply_movie_key_override()
RETURNS trigger AS $$
BEGIN
    UPDATE core.frames f
    SET
        imdb_tconst = m.tconst,
        imdb_primary_title = m.primary_title,
        imdb_original_title = m.original_title,
        imdb_display_title = m.display_title,
        imdb_year = m.start_year,
        runtime_minutes = m.runtime_minutes,
        runtime_seconds = m.runtime_minutes * 60,
        imdb_average_rating = m.average_rating,
        imdb_num_votes = m.num_votes,
        updated_at = now()
    FROM imdb.title_movies_uniq m
    WHERE f.movie_key = NEW.movie_key
      AND m.tconst = NEW.tconst;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;