import { DB } from "https://raw.githubusercontent.com/dyedgreen/deno-sqlite/refs/heads/master/mod.ts";
import { GhostType, MexpGhost, MexpPosition, MexpUser } from "./user.ts";
import { now, shortenName } from "./utils.ts";
import { config } from "./config.ts";

export async function getDB() {
    const db = new DB("./db.sqlite");

    db.query(await Deno.readTextFile("./migrations/001_create_users.sql"));
    db.query(await Deno.readTextFile("./migrations/002_create_ghosts.sql"));

    return db;
}

export const db = await getDB();

export function getPlayer(username: string, dontCreate:boolean, getGhost:boolean): MexpUser|null {
    const user = new MexpUser();

    let pass = "";
    if (username.length == 5) {
        user.username = username;
    } else {
        user.username = shortenName(username);
        pass = username.substring(5);
    }

    if (user.existsOnDB()) {
        const stmt = db.prepareQuery("SELECT * FROM users WHERE username = ?");
        const info = stmt.one([user.username]);
        stmt.finalize();

        const final = MexpUser.fromRow(info, getGhost);
        if (final.pass != pass) return null;
        return final;
    } else {
        if (!config.accountCreation || dontCreate || username.length == 5)
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
        players.push(MexpUser.fromRow(row, true));
    }
    return players;
}

export function getGhost(user: MexpUser): MexpGhost|null {
    const ghost = new MexpGhost();

    ghost.name = user.username;

    if (ghost.existsOnDB()) {
        const stmt = db.prepareQuery("SELECT * FROM ghosts WHERE username = ?");
        const info = stmt.one([ghost.name]);
        stmt.finalize();

        return MexpGhost.fromRow(info, user.lastPlayed);
    } else {
        return null;
    }
}

export function getAllGhosts(): MexpGhost[] {
    const stmt = db.prepareQuery("SELECT * FROM ghosts");
    const info = stmt.all();
    stmt.finalize();

    const ghosts:MexpGhost[] = [];
    for (const row of info) {
        const ghost = MexpGhost.fromRow(row);
        const user = getPlayer(ghost.name, true, false);
        
        if (user) ghost.doTypeCheck(user.lastPlayed);

        ghosts.push(ghost);
    }
    return ghosts;
}

function createPlayer(username: string) {
    const user = new MexpUser();

    user.username = username.substring(0, 5);
    user.pass = username.substring(5);
    user.banned = false;

    user.ghost = new MexpGhost();

    user.ghost.name = shortenName(username);
    user.ghost.type = GhostType.Classic;
    user.ghost.position = new MexpPosition();
    user.ghost.position.x = 0;
    user.ghost.position.y = 0.9;
    user.ghost.position.z = 0;
    user.ghost.position.r = 0;

    user.ghost.scene = "map_welcome";
    user.lastPlayed = now();

    user.commit();
    user.ghost.commit();
    return user;
}