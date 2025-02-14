CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY NOT NULL,
    pass TEXT NOT NULL,
    banned BOOLEAN NOT NULL DEFAULT false,
    lastSpawnData TEXT NOT NULL DEFAULT 'map_welcome 0 0.9 0 0',
    legitTokens TEXT NOT NULL DEFAULT "",
    cheatTokens TEXT NOT NULL DEFAULT "",
    lastPlayed INT NOT NULL DEFAULT 0
);