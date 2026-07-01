DROP TRIGGER IF EXISTS trg_apply_movie_key_override
ON imdb.movie_key_overrides;

CREATE TRIGGER trg_apply_movie_key_override
AFTER INSERT OR UPDATE OF tconst
ON imdb.movie_key_overrides
FOR EACH ROW
EXECUTE FUNCTION imdb.apply_movie_key_override();