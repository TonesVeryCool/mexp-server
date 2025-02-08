import { encode, isAuthorized, RoutingInfo, validateUsername } from "./utils.ts";
import { config, httpsConfig } from "./config.ts";
import { doRouting as post29Router } from "./version/post29.ts";
import { doRouting as pre29Router } from "./version/pre29.ts";
import { getSession, MexpSession, MexpUser } from "./user.ts";

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
    
    if (me != "" && path != (config.version < 29 ? "/m/u/vi" : "/m/u/v") && !(config.version >= 36 && me == "none" && (path == "/m/m/c" || path == "/m/u/c"))) {
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

    const routingInfo:RoutingInfo = {
      req: req,
      path: path,
      user: user,
      session: session,
      me: me,
      au: au,
    }

    if (path == "/anymozu5/me/main/host") {
      const port = config.port == 80 || config.port == 443 ? '': `:${config.port}`;
      return new Response(encode(config.redirectUrl == "" ? `${config.scheme}://${config.ip}${port}/` : config.redirectUrl));
    }

    if (config.version >= 29) {
      const response = await post29Router(routingInfo);
      if (response) return response;
    }

    if (config.version < 29) {
      const response = await pre29Router(routingInfo);
      if (response) return response;
    }
    
    console.log("====================================================")
    console.log(path);
    console.log(req.headers);
    return new Response("404");
  })
}
