import { encode, getRandomFilePath, isAuthorized, now, randf_range, shortenName, validateUsername } from "./utils.ts";
import { db, getPlayer } from "./db.ts";
import { config } from "./config.ts";
import { sessions, MexpPosition, MexpSession, MexpUser, MexpGhost, GhostType } from "./user.ts";

function hasSession(me:string): boolean {
  return sessions.some(session => session.username === me);
}

function getSession(me:string): MexpSession|null {
  return sessions.find(session => session.username === me) ?? null;
}

if (import.meta.main) {
  Deno.serve({port: config.port}, async (req: Request) => {
    const url = new URL(req.url);
    let path = url.pathname;
    if (path.startsWith("//")) {
      path = path.substring(1);
    }

    console.log("====================================================")
    console.log(path);

    const me:string = req.headers.get("me") ?? "";

    let session:MexpSession|null = null;
    let user:MexpUser|null = null;

    if (me != "" && path != "/m/u/v") {
      session = getSession(me);
      if (!session) {
        console.log(`Session for user ${me} doesn't exist!`);
        console.log(session);
        return new Response("");
      }

      user = session.getUser();
      if (!user) {
        console.log(`User for session ${me} doesn't exist!`);
        return new Response("");
      }

      session.resetTimer();
    }

    switch (path)
    {
      case "/anymozu5/me/main/host": {
        return new Response(encode(`http://${config.ip}:${config.port}/`));
      }
      case `/${config.data}/allowed`: {
        return new Response(config.allowed ? "1" : "0");
      }
      case `/${config.data}/version`: {
        return new Response(config.version);
      }
      case "/m/m/d": {
        return new Response(config.data);
      }
      case "/m/u/v": {
        const au:boolean = isAuthorized(req);
        if (!validateUsername(me, au)) {
          return new Response("0");
        }

        const player:MexpUser|null = getPlayer(me, false);
        if (!player) return new Response("0");
        player.lastPlayed = now();
        player.commit();

        if (!hasSession(me)) {
          const session:MexpSession = new MexpSession();
          session.username = me;

          console.log(`welcome, ${shortenName(me)}.`);
          
          sessions.push(session);
        }

        return new Response("1");
      }
      case "/m/u/t": {
        if (!user) return new Response("");
        return new Response(user.legitTokens + " " + user.cheatTokens);
      }
      case "/m/u/s": {
        if (!user) return new Response("");
        return new Response(`${user.ghost.scene} ${user.ghost.position.str()}`);
      }
      case "/m/m/w": {
        if (!user) return new Response("");
        return new Response(await Deno.readTextFile("./assets/wordlist.txt"));
      }
      case "/m/m/m": {
        if (!user) return new Response("");
        let map = req.headers.get("map") ?? "map_void";
        let spawnData = req.headers.get("sd") ?? "0 0.9 0 0";
        try {
          await Deno.lstat(`./assets/maps/${map}.assetBundle`)
        } catch (err) {
          if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
          }

          map = "map_void";
          spawnData = "0 0.9 0 0";
        }

        user.ghost.scene = map;
        user.ghost.position = MexpPosition.fromString(spawnData);
        user.commit();

        console.log(`loading ${map}`);
        return new Response(await Deno.readFile(`./assets/maps/${map}.assetBundle`), {
          status: 200,
          headers: {
            "content-type": "application/octet-stream; charset=binary",
          },
        })
      }
      case "/m/o/g": {
        if (!user) return new Response("");

        const ghosts:MexpGhost[] = [];

        // sorry
        for (let i = 0; i < 250; i++) {
          const funny:MexpGhost = new MexpGhost();
          funny.name = `_editor${i}`;
          funny.position.x = randf_range(-10, 10);
          funny.position.y = randf_range(0, 10);
          funny.position.z = randf_range(-10, 10);
          funny.position.r = randf_range(-180, 180);
          funny.type = GhostType.Authorized;
          funny.speak = "fuck you";
          funny.scene = "map_welcome";
          ghosts.push(funny);
        }

        let final:string = "";

        for (const ghost of ghosts) {
          final += `${ghost.str()}\n`;
        }

        return new Response(final.trim());
      }
      case "/m/n/a": {
        if (!user) return new Response("");

        return new Response(await Deno.readTextFile("./assets/announcement.txt"));
      }
      case "/m/u/g": {
        if (!user) return new Response("");

        const spawnData = req.headers.get("gh");
        if (spawnData) user.ghost.position = MexpPosition.fromString(spawnData);
        user.commit();

        return new Response("1");
      }
      case "/m/o/p": {
        return new Response("1");
      }
      case "/m/o/s": {
        return new Response("1");
      }
      case "/m/m/i": {
        return new Response(await Deno.readFile(`./assets/images/${await getRandomFilePath("./assets/images/")}`), {
          status: 200,
          headers: {
            "content-type": "image/png; charset=binary",
          },
        })
      }
    }

    return new Response("404");
  })
}
