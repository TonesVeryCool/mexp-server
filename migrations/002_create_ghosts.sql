CREATE TABLE IF NOT EXISTS ghosts (
    username TEXT PRIMARY KEY NOT NULL,
    ghostType TEXT NOT NULL,
    scene TEXT NOT NULL DEFAULT 'map_welcome',
    pos TEXT NOT NULL DEFAULT '0 0.9 0 0'
);