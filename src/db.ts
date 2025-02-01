import { DB, Row } from "https://raw.githubusercontent.com/dyedgreen/deno-sqlite/refs/heads/master/mod.ts";
import { MexpGhost, MexpPosition, MexpUser } from "./user.ts";
import { now } from "./utils.ts";
import { config } from "./config.ts";

export async function getDB() {
    const db = new DB("./db.sqlite");

    db.query(await Deno.readTextFile("./migrations/001_create_users.sql"));

    return db;
}

export const db = await getDB();

export function getPlayer(username: string, dontCreate:boolean): MexpUser|null {
    const user = new MexpUser();

    user.username = username;

    if (user.existsOnDB()) {
        const stmt = db.prepareQuery("SELECT * FROM users WHERE username = ?");
        const info = stmt.one([user.username]);
        stmt.finalize();

        return MexpUser.fromRow(info);
    } else {
        if (!config.accountCreation || dontCreate)
        {
            return null;
        }
        return createPlayer(username);
    }
}

export function getAllPlayers(): MexpUser[] {
    const stmt = db.prepareQuery("SELECT * FROM users");
    const info = stmt.all();
    stmt.finalize();

    const players:MexpUser[] = [];
    for (const row of info) {
        players.push(MexpUser.fromRow(row));
    }
    return players;
}

export function getPlayerByShortName(me:string): MexpUser|null {
    try {
        const me2 = me + "%";
        const stmt = db.prepareQuery("SELECT * FROM users WHERE username LIKE ?");
        const info = stmt.one([me2]);
        stmt.finalize();

        return MexpUser.fromRow(info);
    } catch (_err) {
        return null;
    }
}

function createPlayer(username: string) {
    const user = new MexpUser();

    user.username = username;
    user.banned = false;

    user.ghost = new MexpGhost();

    user.ghost.position = new MexpPosition();
    user.ghost.position.x = 0;
    user.ghost.position.y = 0.9;
    user.ghost.position.z = 0;
    user.ghost.position.r = 0;

    user.ghost.scene = "map_welcome";
    user.lastPlayed = now();

    user.commit();
    return user;
}