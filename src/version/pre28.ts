import { getRandomFilePath, hasAllTokens, now, randf_range, RoutingInfo, serverConsoleLog, serverLog, shortenName, validateUsername } from "../utils.ts";
import { getAllPlayers, getPlayer } from "../db.ts";
import { config, tokenMapping } from "../config.ts";
import { sessions, MexpPosition, MexpSession, MexpUser, MexpGhost, hasSession } from "../user.ts";
import { chatMessages, indexesToText, SpeakMessage } from "../speak.ts";
import { shared } from "../shared.ts";

export async function doRouting(info:RoutingInfo) {
  const req:Request = info.req;
  const path:string = info.path;
  const user:MexpUser|null = info.user;
  const session:MexpSession|null = info.session;
  const me:string = info.me;
  const au:boolean = info.au;

  switch (path)
  {
    case `/${config.data}/allowed`: {
      return new Response(config.allowed ? "1" : "0");
    }
    case `/${config.data}/version`: {
      return new Response(config.version.toString());
    }
    case "/m/dl": {
      return new Response(config.data);
    }
    case "/m/vi": {
      const vs = req.headers.get("vs") ?? "0";
      if (!validateUsername(me, au)) {
        return new Response("0");
      }
      
      if (vs != config.version.toString()) {
        return new Response("");
      }
      
      const player:MexpUser|null = getPlayer(me, !config.accountCreation);
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
    case "/m/gt": {
      if (!user) return new Response("");
      return new Response(`${user.legitTokens} ${user.cheatTokens}`);
    }
    case "/m/sd": {
      if (!user) return new Response("");
      return new Response(`${user.ghost.scene} ${user.ghost.position.str()}`);
    }
    case "/m/wl": {
      if (!user) return new Response("");
      return new Response(await Deno.readTextFile("./assets/wordlist.txt"));
    }
    case "/m/gm": {
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
    case "/m/gg": {
      if (!user) return new Response("");
      const map = user.ghost.scene ?? "";
      
      const ghosts:MexpGhost[] = [];
      
      for (const player of getAllPlayers())
        {
        if (player.username == user.username) continue;
        if (player.ghost.scene == map) continue;
        if (map == "map_void") continue;
        ghosts.push(player.ghost);
      }
      
      let final:string = "";
      
      for (const ghost of ghosts) {
        final += `${ghost.str()}\n`;
      }
      
      return new Response(final.trim());
    }
    case "/m/ga": {
      if (!user) return new Response("");
      
      return new Response(await Deno.readTextFile("./assets/announcement.txt"));
    }
    case "/m/gn": {
      if (!user) return new Response("");
      
      return new Response(await Deno.readTextFile("./assets/news.txt"));
    }
    case "/m/sg": {
      if (!user) return new Response("");
      
      const spawnData = req.headers.get("gh");
      if (spawnData) user.ghost.position = MexpPosition.fromString(spawnData);
      user.commit();
      
      serverConsoleLog(`${me}`);
      serverConsoleLog(`${spawnData}`);
      
      return new Response(config.version < 35 ? "check" : "1");
    }
    case "/m/pc": {
      if (!user) return new Response("");
      
      return new Response(sessions.length.toString());
    }
    case "/m/cp": {
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
    case "/m/gs": {
      if (!user) return new Response("");
      
      let final:string = "";
      
      for (const message of chatMessages) {
        final += `${message.username}: ${message.message}\n`;
      }
      
      final = final.substring(0, final.length - 1);
      
      return new Response(final);
    }
    case "/m/ss": {
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
    case "/m/st": {
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
    case "/m/im": {
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
    case "/m/tv": {
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
  }
}