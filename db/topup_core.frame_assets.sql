INSERT INTO core.frame_assets (
    frame_id,
    asset_type,
    storage_path,
    image_sha256
)
SELECT
    f.id AS frame_id,
    'original' AS asset_type,
    raw.local_image_path AS storage_path,
    raw.image_sha256
FROM core.frames f
JOIN ingest.frames_shotdeck_raw raw
    ON raw.source = f.source
   AND raw.source_frame_id = f.source_frame_id
WHERE raw.local_image_path IS NOT NULL
ON CONFLICT (frame_id, asset_type) DO UPDATE
SET
    storage_path = EXCLUDED.storage_path,
    image_sha256 = EXCLUDED.image_sha256;