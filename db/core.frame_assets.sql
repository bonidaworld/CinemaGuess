CREATE TABLE core.frame_assets (
    id bigserial PRIMARY KEY,

    frame_id bigint NOT NULL REFERENCES core.frames(id) ON DELETE CASCADE,

    asset_type text NOT NULL
        CHECK (asset_type IN ('original', 'web', 'thumb')),

    storage_path text NOT NULL,

    image_sha256 text,
    width integer,
    height integer,
    file_size_bytes bigint,
    mime_type text,

    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_frame_assets_frame_type
        UNIQUE (frame_id, asset_type)
);