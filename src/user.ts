import { DB, Row } from "https://raw.githubusercontent.com/dyedgreen/deno-sqlite/refs/heads/master/mod.ts";
import { db, getPlayer } from "./db.ts";
import { now, serverLog, shortenName } from "./utils.ts";
import { lastMessageFrom } from "./speak.ts";

export const sessions:MexpSession[] = [];

export class MexpSession {
    username:string = "_editor";
    inactivityTimer:number = 0;
    mapChangeTimer:number = 0;

    legitBallpitAlt:boolean = false;

    constructor() {
        this.resetTimer();
    }

    public resetTimer() {
        if (this.inactivityTimer) clearTimeout(this.inactivityTimer);

        this.inactivityTimer = setTimeout(() => {
            const index = sessions.indexOf(this);
            if (index > -1) sessions.splice(index, 1);
            serverLog(`see you soon, ${shortenName(this.username)}.`);
        }, 15000);
    }

    public clearMapTimer() {
        if (this.mapChangeTimer) clearTimeout(this.mapChangeTimer);
    }
    
    public doMapTimer(finalMap:string) {
        this.clearMapTimer();

        this.mapChangeTimer = setTimeout(() => {
            const user = this.getUser();
            if (!user) return;
            user.ghost.scene = finalMap;
            user.commit();
        }, 1000 * 60 * 10);
    }

    destroy() {
        clearTimeout(this.inactivityTimer);
        clearTimeout(this.mapChangeTimer);
    }

    public getUser(): MexpUser|null {
        return getPlayer(this.username, true);
    }
}

export class MexpPosition {
    x:number = 0;
    y:number = 0.9;
    z:number = 0;
    r:number = 0;

    static fromString(str: string): MexpPosition {
        const pos:MexpPosition = new MexpPosition();
        const split = str.split(" ");

        pos.x = Number.parseFloat(split[0]);
        pos.y = Number.parseFloat(split[1]);
        pos.z = Number.parseFloat(split[2]);
        pos.r = Number.parseFloat(split[3]);
        return pos
    }

    static fromRow(row: Row): MexpPosition {
        const pos:MexpPosition = new MexpPosition();

        pos.x = row[3] as number;
        pos.y = row[4] as number;
        pos.z = row[5] as number;
        pos.r = row[6] as number;
        return pos
    }

    public str(): string {
        return `${this.x} ${this.y} ${this.z} ${this.r}`;
    }
}

export enum GhostType {
    Classic,
    Authorized,
    Upgrade,
    Inactive,
    It
}

export class MexpGhost {
    name:string = "";
    speak:string = "NO MESSAGE";
    scene:string = "map_welcome";
    position:MexpPosition = new MexpPosition;
    type:GhostType = GhostType.Classic;

    static fromRow(row: Row): MexpGhost {
        const ghost:MexpGhost = new MexpGhost();

        ghost.scene = row[2] as string;
        ghost.position = MexpPosition.fromRow(row);

        const name = row[0] as string;
        const banned = row[1] as boolean;
        const lastPlayed = row[9] as number;

        ghost.name = name;
        ghost.speak = lastMessageFrom(shortenName(name));

        if (name.startsWith("_"))
        {
            ghost.type = (name == "_editor") ? GhostType.Authorized : GhostType.It;
        }
        else
        {
            if (name.startsWith("fuck") && name.length < 64) ghost.type = GhostType.It;
            else if (banned) ghost.type = GhostType.Upgrade;
            else ghost.type = (now() - lastPlayed >= 15) ? GhostType.Inactive : GhostType.Classic;
        }

        ghost.name = shortenName(ghost.name);

        return ghost;
    }

    private static typeToStr(type:GhostType):string {
        switch (type) {
            case GhostType.Classic: return "Classic";
            case GhostType.Authorized: return "Authorized";
            case GhostType.Upgrade: return "Upgrade";
            case GhostType.Inactive: return "Inactive";
            case GhostType.It: return "It";
        }
    }

    public str(): string {
        return `${this.position.str()} ${MexpGhost.typeToStr(this.type)} ${this.name} ${this.speak}`
    }
}

export class MexpUser {
    username:string = "_editor";
    banned:boolean = false;
    ghost: MexpGhost = new MexpGhost;
    legitTokens:string = "";
    cheatTokens:string = "";
    lastPlayed:number = 0;

    public commit() {
        if (this.existsOnDB()) {
            this.updateOnDB();
        } else {
            this.createOnDB();
        }
    }

    public existsOnDB() {
        const stmt = db.prepareQuery("SELECT * FROM users WHERE username = ?");
        const rows = stmt.all([this.username]);
        stmt.finalize();
        return rows.length > 0;
    }

    private updateOnDB() {
        const stmt = db.prepareQuery("UPDATE users SET banned = ?, scene = ?, x = ?, y = ?, z = ?, r = ?, legitTokens = ?, cheatTokens = ?, lastPlayed = ? WHERE username = ?");
        stmt.execute([
            this.banned,
            this.ghost.scene,
            this.ghost.position.x,
            this.ghost.position.y,
            this.ghost.position.z,
            this.ghost.position.r,
            this.legitTokens,
            this.cheatTokens,
            this.lastPlayed,
            this.username
        ]);
        stmt.finalize();
    }

    private createOnDB() {
        const stmt = db.prepareQuery("INSERT INTO users (username, banned, scene, x, y, z, r, legitTokens, cheatTokens, lastPlayed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        stmt.execute([
            this.username,
            this.banned,
            this.ghost.scene,
            this.ghost.position.x,
            this.ghost.position.y,
            this.ghost.position.z,
            this.ghost.position.r,
            this.legitTokens,
            this.cheatTokens,
            this.lastPlayed
        ]);
        stmt.finalize();
    }

    static fromRow(row: Row): MexpUser {
        const user:MexpUser = new MexpUser();

        user.username = row[0] as string;
        user.banned = row[1] as boolean;
        user.ghost = MexpGhost.fromRow(row);
        user.legitTokens = row[7] as string;
        user.cheatTokens = row[8] as string;
        user.lastPlayed = row[9] as number;
        return user;
    }
}