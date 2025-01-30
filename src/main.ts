import { encode, getRandomFilePath, isAuthorized, now, randf_range, shortenName, validateUsername } from "./utils.ts";
import { db, getAllPlayers, getPlayer } from "./db.ts";
import { config } from "./config.ts";
import { sessions, MexpPosition, MexpSession, MexpUser, MexpGhost, GhostType } from "./user.ts";
import { chatMessages, indexesToText, SpeakMessage } from "./speak.ts";

const hasSession = (me:string): boolean => sessions.some(session => session.username === me);
const getSession = (me:string): MexpSession|null => sessions.find(session => session.username === me) ?? null;

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

        for (const player of getAllPlayers())
        {
          if (player.username == user.username) continue;
          ghosts.push(player.ghost);
        }

        let final:string = "";

        for (const ghost of ghosts) {
          final += `${ghost.str()}\n`;
        }

        console.log(final);

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
        console.log(final);

        const chatMessage:SpeakMessage = new SpeakMessage();
        chatMessage.username = shortenName(user.username);
        chatMessage.message = final;

        chatMessages.push(chatMessage);

        if (chatMessages.length > 20) {
          chatMessages.shift();
        }

        return new Response("1");
      }
      case "/m/o/t": {
        if (!user) return new Response("");
        const tk = req.headers.get("tk") ?? "cave";

        // TODO: make it have the v35 security
        user.legitTokens += ` ${tk}`;
        user.legitTokens = user.legitTokens.trimStart();
        user.commit();

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
    }

    return new Response("404");
  })
}
