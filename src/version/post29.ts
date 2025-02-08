import { getAllPaths, now, randomLetters, RoutingInfo, serverConsoleLog, shortenName, timeSinceLastOnline } from "../utils.ts";
import { getPlayer, getPlayerByShortName } from "../db.ts";
import { config, } from "../config.ts";
import { MexpSession, MexpUser } from "../user.ts";
import { Captcha, captchas } from "../captcha.ts";
import { m_dl, m_gg, m_gm, m_gt, m_sd, m_vi, m_wl, mexp_allowed, mexp_version } from "./shared.ts";
import { m_ga } from "./shared.ts";
import { m_gn } from "./shared.ts";
import { m_sg } from "./shared.ts";
import { m_pc } from "./shared.ts";
import { m_cp } from "./shared.ts";
import { m_gs } from "./shared.ts";
import { m_ss } from "./shared.ts";
import { m_st } from "./shared.ts";
import { m_im } from "./shared.ts";
import { m_tv } from "./shared.ts";

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
      return mexp_allowed();
    }
    case `/${config.data}/version`: {
      return mexp_version();
    }
    case "/m/m/d": {
      return m_dl();
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
      return m_vi(req, me, au);
    }
    case "/m/u/t": {
      return m_gt(user);
    }
    case "/m/u/s": {
      return m_sd(user);
    }
    case "/m/m/w": {
      return await m_wl(user);
    }
    case "/m/m/m": {
      return await m_gm(req, user, session, me, au);
    }
    case "/m/o/g": {
      return m_gg(user);
    }
    case "/m/n/a": {
      return await m_ga(user);
    }
    case "/m/n/n": {
      return await m_gn(user);
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
      return m_sg(req, user, me);
    }
    case "/m/o/p": {
      return m_pc(user);
    }
    case "/m/o/c": {
      return m_cp(req, user, me);
    }
    case "/m/m/s": {
      return m_gs(user);
    }
    case "/m/o/s": {
      return await m_ss(req, user);
    }
    case "/m/o/t": {
      return m_st(req, user, session, me, au);
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
      return await m_im(user, me);
    }
    case "/m/m/t": {
      return await m_tv(user, me);
    }
  }
}