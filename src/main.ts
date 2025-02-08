import { encode, getAllPaths, getRandomFilePath, hasAllTokens, isAuthorized, now, randf_range, randomLetters, serverConsoleLog, serverLog, shortenName, timeSinceLastOnline, validateUsername } from "./utils.ts";
import { getAllPlayers, getPlayer, getPlayerByShortName } from "./db.ts";
import { config, httpsConfig, tokenMapping } from "./config.ts";
import { sessions, MexpPosition, MexpSession, MexpUser, MexpGhost } from "./user.ts";
import { chatMessages, indexesToText, SpeakMessage } from "./speak.ts";
import { Captcha, captchas } from "./captcha.ts";

let isScreenOn:boolean = true;

const hasSession = (me:string): boolean => sessions.some(session => session.username === me);
const getSession = (me:string): MexpSession|null => sessions.find(session => session.username === me) ?? null;

if (import.meta.main) {
  const usesHttps = (httpsConfig.fullchain && httpsConfig.privkey);
  const settings = usesHttps ?
  {port: config.port, cert: await Deno.readTextFile(httpsConfig.fullchain), key: await Deno.readTextFile(httpsConfig.privkey)} : 
  {port: config.port};

  Deno.serve(settings, async (req: Request) => {
    const url = new URL(req.url);
    let path = url.pathname;
    if (path.startsWith("//")) {
      path = path.substring(1);
    }
    
    const me:string = req.headers.get("me") ?? "";
    
    let session:MexpSession|null = null;
    let user:MexpUser|null = null;
    let au:boolean = false;
    
    if (me != "" && path != "/m/u/v" && !(config.version >= 36 && me == "none" && (path == "/m/m/c" || path == "/m/u/c"))) {
      session = getSession(me);
      if (!session) {
        if (config.extraLogging) console.log(`Session for user ${me} doesn't exist!`);
        return new Response("");
      }
      
      user = session.getUser();
      if (!user) {
        if (config.extraLogging) console.log(`User for session ${me} doesn't exist!`);
        return new Response("");
      }
    
      au = isAuthorized(req);
      if (!validateUsername(me, au)) {
        user = null;
        session = null;
      }

      if (session != null) session.resetTimer();
    }

    switch (path)
    {
      case "/anymozu5/me/main/host": {
        const port = config.port == 80 || config.port == 443 ? '': `:${config.port}`;
        return new Response(encode(config.redirectUrl == "" ? `${config.scheme}://${config.ip}${port}/` : config.redirectUrl));
      }
      case `/${config.data}/allowed`: {
        return new Response(config.allowed ? "1" : "0");
      }
      case `/${config.data}/version`: {
        return new Response(config.version.toString());
      }
      case "/m/m/d": {
        return new Response(config.data);
      }
      case "/m/m/c": {
        if (config.version >= 36) {
          const captcha = new Captcha();
          captchas.push(captcha);
          
          return new Response(await captcha.generateImage(), {
            status: 200,
            headers: {
              "content-type": "image/png; charset=binary",
            },
          });
        } else {
          return new Response("404");
        }
      }
      case "/m/u/c": {
        if (config.version >= 36) {
          const ca = req.headers.get("ca") ?? "wrong";
          for (const captcha of captchas) {
            if (captcha.answer == ca) {
              const newMe = randomLetters(64);
              
              const player:MexpUser|null = getPlayer(newMe, false);
              if (!player) {
                return new Response("0");
              }
              
              return new Response(newMe);
            }
          }
          return new Response("0");
        } else {
          return new Response("404");
        }
      }
      case "/m/u/v": {
        const vs = req.headers.get("vs") ?? "0";
        if (!validateUsername(me, au)) {
          return new Response("0");
        }
        
        if (vs != config.version.toString()) {
          return new Response("");
        }
        
        const player:MexpUser|null = getPlayer(me, (config.version >= 36 && !au));
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
      case "/m/o/g": {
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
      case "/m/n/a": {
        if (!user) return new Response("");
        
        return new Response(await Deno.readTextFile("./assets/announcement.txt"));
      }
      case "/m/n/n": {
        if (!user) return new Response("");
        
        return new Response(await Deno.readTextFile("./assets/news.txt"));
      }
      case "/m/u/p": {
        if (!user) return new Response("");
        const target = req.headers.get("pr") ?? shortenName(me);
        if (target.length != 5) return new Response("");

        const targetUser = getPlayerByShortName(target);
        if (!targetUser) return new Response("");

        if (target == "_work") {
          return new Response(``);
        }

        if (target == "_edit") {
          return new Response(`_edit\nDon't mess with it.\nalways\nall`);
        }
        
        const speakMsg = targetUser.ghost.speak.replace("@", " ").trim();
        const finalMsg = speakMsg == "" ? `` : `'${speakMsg}'`;
        
        const lastOnline = now() - targetUser.lastPlayed;

        return new Response(`${target}\n${finalMsg}\n${timeSinceLastOnline(lastOnline)}\n${targetUser.legitTokens.split(" ").join(", ")}`);
      }
      case "/m/u/g": {
        if (!user) return new Response("");
        
        const spawnData = req.headers.get("gh");
        if (spawnData) user.ghost.position = MexpPosition.fromString(spawnData);
        user.commit();

        serverConsoleLog(`${me}`);
        serverConsoleLog(`${spawnData}`);
        
        return new Response(config.version < 35 ? "check" : "1");
      }
      case "/m/o/p": {
        if (!user) return new Response("");
        
        return new Response(sessions.length.toString());
      }
      case "/m/o/c": {
        if (!user) return new Response("");
        const pa = req.headers.get("pa") ?? "none";
        // deno-lint-ignore no-unused-vars
        const va = req.headers.get("va") ?? "";
        
        if (pa == "ts") {
          if (config.validateMaps && user.ghost.scene != "map_theater_employee") return new Response("");
          
          isScreenOn = !isScreenOn;
          serverLog(`${shortenName(me)} turned the screen ${isScreenOn ? "on" : "off"}.`);
        }
        
        return new Response(config.version < 35 ? "check" : "1");
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
        serverLog(`\`${chatMessage.username}: ${chatMessage.message}\``, false);
        
        chatMessages.push(chatMessage);
        
        if (chatMessages.length > 20) {
          chatMessages.shift();
        }
        
        return new Response(config.version < 35 ? "check" : "1");
      }
      case "/m/o/t": {
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
      case "/m/m/a": {
        if (config.version < 37) return new Response("404");
        const id = req.headers.get("id");
        
        if (!id) return new Response("");

        if (id == "0") {
          const paths:string[] = await getAllPaths("./assets/ads/");

          return new Response(paths.join(";"));
        }

        serverConsoleLog(`sending ads/${id}`);

        if (id.includes("..")) return new Response("");
        
        return new Response(await Deno.readFile(`./assets/ads/${id}`), {
          status: 200,
          headers: {
            "content-type": "image/png; charset=binary",
          },
        });
      }
      case "/m/m/i": {
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
      case "/m/m/t": {
        if (!user) return new Response("");
        if (!isScreenOn) return new Response("");

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
    
    console.log("====================================================")
    console.log(path);
    console.log(req.headers);
    return new Response("404");
  })
}
