import { encode, getRandomFilePath, isAuthorized, now, randf_range, serverLog, shortenName, validateUsername } from "./utils.ts";
import { db, getAllPlayers, getPlayer } from "./db.ts";
import { config, mapTokens, tokenMapping } from "./config.ts";
import { sessions, MexpPosition, MexpSession, MexpUser, MexpGhost, GhostType } from "./user.ts";
import { chatMessages, indexesToText, SpeakMessage } from "./speak.ts";

let isScreenOn:boolean = true;

const hasSession = (me:string): boolean => sessions.some(session => session.username === me);
const getSession = (me:string): MexpSession|null => sessions.find(session => session.username === me) ?? null;

if (import.meta.main) {
  Deno.serve({port: config.port}, async (req: Request) => {
    const url = new URL(req.url);
    let path = url.pathname;
    if (path.startsWith("//")) {
      path = path.substring(1);
    }

    // console.log("====================================================")
    // console.log(path);

    const me:string = req.headers.get("me") ?? "";

    let session:MexpSession|null = null;
    let user:MexpUser|null = null;

    if (me != "" && path != "/m/u/v") {
      session = getSession(me);
      if (!session) {
        console.log(`Session for user ${me} doesn't exist!`);
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

          serverLog(`welcome, ${shortenName(me)}.`);
          
          sessions.push(session);
        }

        return new Response("1");
      }
      case "/m/u/t": {
        if (!user) return new Response("");
        return new Response(`${user.legitTokens} ${user.cheatTokens}`);
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
        if (!user || !session) return new Response("");

        session.clearMapTimer();

        let map = req.headers.get("map") ?? "map_void";
        let spawnData = req.headers.get("sd") ?? "0 0.9 0 0";

        try {
          const tokens = user.legitTokens.split(" ");
          if (mapTokens[map] != '' && !tokens.includes(mapTokens[map]) && config.validateMaps)
          {
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

        return new Response(await Deno.readFile(`./assets/maps/${map}.assetBundle`), {
          status: 200,
          headers: {
            "content-type": "application/octet-stream; charset=binary",
          },
        })
      }
      case "/m/o/g": {
        if (!user) return new Response("");
        const map = user.ghost.scene ?? "";

        const ghosts:MexpGhost[] = [];

        for (const player of getAllPlayers())
        {
          if (player.username == user.username) continue;
          if (player.ghost.scene == map) continue;
          ghosts.push(player.ghost);
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
        if (!user) return new Response("");

        return new Response(sessions.length.toString());
      }
      case "/m/o/c": {
        if (!user) return new Response("");

        isScreenOn = !isScreenOn;
        serverLog(`${shortenName(me)} turned the screen ${isScreenOn ? "on" : "off"}.`);

        return new Response("1");
      }
      case "/m/m/s": {
        if (!user) return new Response("");

        let final:string = "";

        for (const message of chatMessages) {
          final += `${message.username}: ${message.message}\n`;
        }

        final = final.substring(0, final.length - 1);

        return new Response(final);
      }
      case "/m/o/s": {
        if (!user) return new Response("");

        const message = req.headers.get("sp") ?? "";
        const split = message.split(" ");

        if (split.length == 0) return new Response("");

        const final = await indexesToText(split);

        const chatMessage:SpeakMessage = new SpeakMessage();
        chatMessage.username = shortenName(user.username);
        chatMessage.message = final;
        serverLog(`\`${chatMessage.username}: ${chatMessage.message}\``);

        chatMessages.push(chatMessage);

        if (chatMessages.length > 20) {
          chatMessages.shift();
        }

        return new Response("1");
      }
      case "/m/o/t": {
        if (!user) return new Response("");
        const tk = req.headers.get("tk") ?? "cave";
        const map = user.ghost.scene;

        if (!config.allTokens.includes(tk)) {
          return new Response("1");
        }

        try {
          if (tokenMapping[tk] != map && config.validateTokens) {
            user.cheatTokens += ` ${tk}`;
            user.cheatTokens = user.cheatTokens.trimStart();
            user.commit();
          } else {
            const cheatedTokens = user.cheatTokens.split(" ");

            if (cheatedTokens.includes(tk)) return new Response("1");

            serverLog(`${shortenName(me)} got a token: \`${tk}\``);
            user.legitTokens += ` ${tk}`;
            user.legitTokens = user.legitTokens.trimStart();
            user.commit();
          }
        } catch (_err) {
          // TODO: what is meant to happen if an error occurs?
        }

        return new Response("1");
      }
      case "/m/m/i": {
        if (!user) return new Response("");

        return new Response(await Deno.readFile(`./assets/images/${await getRandomFilePath("./assets/images/")}`), {
          status: 200,
          headers: {
            "content-type": "image/png; charset=binary",
          },
        })
      }
      case "/m/m/t": {
        if (!user) return new Response("");
        if (!isScreenOn) return new Response("");

        return new Response(await Deno.readFile(`./assets/videos/${await getRandomFilePath("./assets/videos/")}`), {
          status: 200,
          headers: {
            "content-type": "video/mp4; charset=binary",
          },
        })
      }
    }

    return new Response("404");
  })
}
