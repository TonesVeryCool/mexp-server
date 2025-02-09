import { config, tokenMapping } from "../config.ts";
import { getAllPlayers, getPlayer } from "../db.ts";
import { shared } from "../shared.ts";
import { chatMessages, indexesToText, SpeakMessage } from "../speak.ts";
import { hasSession, MexpGhost, MexpPosition, MexpSession, MexpUser, sessions } from "../user.ts";
import { getRandomFilePath, hasAllTokens, now, randf_range, serverConsoleLog, serverLog, shortenName, validateUsername } from "../utils.ts";

export const mexp_allowed = () => {
    return new Response(config.allowed ? "1" : "0");
}

export const mexp_version = () => {
    return new Response(config.version.toString());
}

export const m_dl = () => {
    return new Response(config.data);
}

export const m_vi = (req:Request, me:string, au:boolean) => {
    const vs = req.headers.get("vs") ?? "0";
    if (!validateUsername(me, au)) {
        return new Response("0");
    }
    
    if (vs != config.version.toString()) {
        return new Response("");
    }
    
    const player:MexpUser|null = getPlayer(me, (config.version >= 36 && !au && !config.accountCreation));
    if (!player) return new Response("");
    if (player.banned) return new Response("0");
    
    player.lastPlayed = now();
    player.commit();
    
    if (!hasSession(me)) {
        const session:MexpSession = new MexpSession();
        session.username = me;
        
        serverLog(`welcome, ${shortenName(me)}.`);
        
        sessions.push(session);
    }
    
    return new Response("1");
}

export const m_gt = (user:MexpUser|null) => {
    if (!user) return new Response("");
    return new Response(`${user.legitTokens} ${user.cheatTokens}`);
}

export const m_sd = (user:MexpUser|null) => {
    if (!user) return new Response("");
    return new Response(`${user.ghost.scene} ${user.ghost.position.str()}`);
}

export const m_wl = async (user:MexpUser|null) => {
    if (!user) return new Response("");
    return new Response(await Deno.readTextFile("./assets/wordlist.txt"));
}

export const m_gm = async (req:Request, user:MexpUser|null, session:MexpSession|null, me:string, au:boolean) => {
    if (!user || !session) return new Response("");
    
    session.legitBallpitAlt = false;
    session.clearMapTimer();
    
    let map = req.headers.get("map") ?? "map_void";
    let spawnData = req.headers.get("sd") ?? "0 0.9 0 0";
    
    try {
        const tokens = user.legitTokens.split(" ");
        if (!hasAllTokens(map, tokens) && config.validateMaps && !au) {
            throw new Deno.errors.NotFound("Was the map found? I don't know, the user doesn't have access to it!");
        }
        await Deno.lstat(`./assets/maps/${map}.assetBundle`)
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
        
        map = "map_void";
        spawnData = "0 0.9 0 0";
    }
    
    if (map == "map_ballpit_cave" && randf_range(0.0, 100.0) >= (100 - (config.ballpitAltChance ?? 2))) {
        session.legitBallpitAlt = true;
        map = "map_ballpit_alt";
    }
    
    if (map == "map_hell") {
        serverLog(`you deserve it, ${shortenName(me)}.`);
        session.doMapTimer("map_welcome");
    }
    
    if (map == "map_void") {
        session.doMapTimer("map_welcome");
    }
    
    if (map == "map_maze") {
        session.doMapTimer("map_void");
    }
    
    user.ghost.scene = map;
    user.ghost.position = MexpPosition.fromString(spawnData);
    user.commit();
    
    serverConsoleLog(`${me} ${map}`);
    
    return new Response(await Deno.readFile(`./assets/maps/${map}.assetBundle`), {
        status: 200,
        headers: {
            "content-type": "application/octet-stream; charset=binary",
        },
    })
}

export const m_gg = (user:MexpUser|null) => {
    if (!user) return new Response("");
    const map = user.ghost.scene ?? "";
    
    const ghosts:MexpGhost[] = [];
    
    for (const player of getAllPlayers())
    {
        if (player.username == user.username) continue;
        if (player.ghost.scene != map) continue;
        if (map == "map_void") continue;
        ghosts.push(player.ghost);
    }
    
    let final:string = "";
    
    for (const ghost of ghosts) {
        final += `${ghost.str()}\n`;
    }
    
    return new Response(final.trim());
}

export const m_ga = async (user:MexpUser|null) => {
    if (!user) return new Response("");
    return new Response(await Deno.readTextFile("./assets/announcement.txt"));
}

export const m_gn = async (user:MexpUser|null) => {
    if (!user) return new Response("");
    return new Response(await Deno.readTextFile("./assets/news.txt"));
}

export const m_sg = (req:Request, user:MexpUser|null, me:string) => {
    if (!user) return new Response("");
    
    const spawnData = req.headers.get("gh");
    if (spawnData) user.ghost.position = MexpPosition.fromString(spawnData);
    user.commit();
    
    serverConsoleLog(`${me}`);
    serverConsoleLog(`${spawnData}`);
    
    return new Response(config.version < 35 ? "check" : "1");
}

export const m_pc = (user:MexpUser|null) => {
    if (!user) return new Response("");
    return new Response(sessions.length.toString());
}

export const m_cp = (req:Request, user:MexpUser|null, me:string) => {
    if (!user) return new Response("");
    const pa = req.headers.get("pa") ?? "none";
    // deno-lint-ignore no-unused-vars
    const va = req.headers.get("va") ?? "";
    
    if (pa == "ts") {
        if (config.validateMaps && user.ghost.scene != "map_theater_employee") return new Response("");
        
        shared.isScreenOn = !shared.isScreenOn;
        serverLog(`${shortenName(me)} turned the screen ${shared.isScreenOn ? "on" : "off"}.`);
    }
    
    return new Response(config.version < 35 ? "check" : "1");
}

export const m_gs = (user:MexpUser|null) => {
    if (!user) return new Response("");
    
    let final:string = "";
    
    for (const message of chatMessages) {
        final += `${message.username}: ${message.message}\n`;
    }
    
    final = final.substring(0, final.length - 1);
    
    return new Response(final);
}

export const m_ss = async (req:Request, user:MexpUser|null) => {
    if (!user) return new Response("");
    
    const message = req.headers.get("sp") ?? "";
    const split = message.split(" ");
    
    if (split.length == 0) return new Response("");
    
    const final = await indexesToText(split);
    
    const chatMessage:SpeakMessage = new SpeakMessage();
    chatMessage.username = shortenName(user.username);
    chatMessage.message = final;
    serverLog(`\`${chatMessage.username}: ${chatMessage.message}\``, false);
    
    chatMessages.push(chatMessage);
    
    if (chatMessages.length > 20) {
        chatMessages.shift();
    }
    
    return new Response(config.version < 35 ? "check" : "1");
}

export const m_st = (req:Request, user:MexpUser|null, session:MexpSession|null, me:string, au:boolean) => {
    if (!user) return new Response("");
    if (!session) return new Response("");
    
    const tk = req.headers.get("tk") ?? "cave";
    const map = user.ghost.scene;
    
    if (!config.allTokens.includes(tk)) {
        return new Response("");
    }
    
    try {
        if ((tokenMapping[tk] != map || (tk == "underground_part2" && !session.legitBallpitAlt)) && config.validateTokens && !au) {
            user.cheatTokens += ` ${tk}`;
            user.cheatTokens = user.cheatTokens.trimStart();
            user.commit();
            
            return new Response("");
        } else {
            const cheatedTokens = user.cheatTokens.split(" ");
            
            if (cheatedTokens.includes(tk)) return new Response("");
            
            serverLog(`${shortenName(me)} got a token: \`${tk}\``);
            user.legitTokens += ` ${tk}`;
            user.legitTokens = user.legitTokens.trimStart();
            user.commit();
        }
    } catch (_err) {
        // TODO: what is meant to happen if an error occurs?
    }
    
    return new Response(config.version < 35 ? "check" : "1");
}

export const m_im = async (user:MexpUser|null, me:string) => {
    if (!user) return new Response("");
    
    const path = await getRandomFilePath("./assets/images/");
    
    serverConsoleLog(`${me}`);
    serverConsoleLog(`sending ${path}`);
    
    return new Response(await Deno.readFile(`./assets/images/${path}`), {
        status: 200,
        headers: {
            "content-type": "image/png; charset=binary",
        },
    })
}

export const m_tv = async (user:MexpUser|null, me:string) => {
    if (!user) return new Response("");
    if (!shared.isScreenOn) return new Response("");
    
    const path = await getRandomFilePath("./assets/videos/");
    
    serverConsoleLog(`${me}`);
    serverConsoleLog(`sending ${path}`);
    
    return new Response(await Deno.readFile(`./assets/videos/${path}`), {
        status: 200,
        headers: {
            "content-type": "video/mp4; charset=binary",
        },
    })
}