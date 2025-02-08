import { RoutingInfo } from "../utils.ts";
import { config } from "../config.ts";
import { MexpSession, MexpUser } from "../user.ts";
import { m_cp, m_dl, m_ga, m_gg, m_gm, m_gn, m_gs, m_gt, m_im, m_pc, m_sd, m_sg, m_ss, m_st, m_tv, m_vi, m_wl, mexp_allowed, mexp_version } from "./shared.ts";

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
    case "/m/dl": {
      return m_dl();
    }
    case "/m/vi": {
      return m_vi(req, me, au);
    }
    case "/m/gt": {
      return m_gt(user);
    }
    case "/m/sd": {
      return m_sd(user);
    }
    case "/m/wl": {
      return await m_wl(user);
    }
    case "/m/gm": {
      return await m_gm(req, user, session, me, au);
    }
    case "/m/gg": {
      return m_gg(user);
    }
    case "/m/ga": {
      return await m_ga(user);
    }
    case "/m/gn": {
      return await m_gn(user);
    }
    case "/m/sg": {
      return m_sg(req, user, me);
    }
    case "/m/pc": {
      return m_pc(user);
    }
    case "/m/cp": {
      return m_cp(req, user, me);
    }
    case "/m/gs": {
      return m_gs(user);
    }
    case "/m/ss": {
      return await m_ss(req, user);
    }
    case "/m/st": {
      return m_st(req, user, session, me, au);
    }
    case "/m/im": {
      return await m_im(user, me);
    }
    case "/m/tv": {
      return await m_tv(user, me);
    }
  }
}