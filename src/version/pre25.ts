import { RoutingInfo } from "../utils.ts";
import { serverConfig } from "../config.ts";
import { MexpSession, MexpUser } from "../user.ts";
import { m_cp, m_dl, m_ga, m_gg, m_gm, m_gn, m_gs, m_gt, m_im, m_pc, m_sd, m_sg, m_sm, m_ss, m_st, m_tv, m_vi, m_wl, mexp_allowed, mexp_version } from "./shared.ts";

export async function doRouting(info:RoutingInfo) {
  const req:Request = info.req;
  const path:string = info.path;
  const user:MexpUser|null = info.user;
  const session:MexpSession|null = info.session;
  const me:string = info.me;
  const au:boolean = info.au;

  switch (path)
  {
    case `/${serverConfig.data}/allowed`: {
      return mexp_allowed();
    }
    case `/${serverConfig.data}/version`: {
      return mexp_version();
    }
    case "/dl": {
      return m_dl();
    }
    case "/vi": {
      return m_vi(req, me, au);
    }
    case "/gt": {
      return m_gt(user, me);
    }
    case "/sm": {
      return m_sm(user);
    }
    case "/sd": {
      return m_sd(user);
    }
    case "/wl": {
      return await m_wl(user);
    }
    case "/gm": {
      return await m_gm(req, user, session, me, au);
    }
    case "/gg": {
      return m_gg(user);
    }
    case "/ga": {
      return await m_ga(user);
    }
    case "/gn": {
      return await m_gn(user);
    }
    case "/sg": {
      return m_sg(req, user, me);
    }
    case "/pc": {
      return m_pc(user);
    }
    case "/cp": {
      return m_cp(req, user, me);
    }
    case "/gs": {
      return m_gs(user);
    }
    case "/ss": {
      return await m_ss(req, user);
    }
    case "/st": {
      return m_st(req, user, session, me, au);
    }
    case "/im": {
      return await m_im(user, me);
    }
    case "/tv": {
      return await m_tv(user, me, req.headers.get("ty") ?? '');
    }
  }
}