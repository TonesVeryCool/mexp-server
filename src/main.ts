import { encode, isAuthorized, RoutingInfo, validateUsername } from "./utils.ts";
import { serverConfig, gameConfig, httpsConfig } from "./config.ts";
import { doRouting as post28Router } from "./version/post28.ts";
import { doRouting as v28Router } from "./version/28.ts";
import { doRouting as pre28Router } from "./version/pre28.ts";
import { doRouting as pre25Router } from "./version/pre25.ts";
import { getSession, MexpSession, MexpUser } from "./user.ts";
import { version_mexp } from "./version/shared.ts";
import { terminalApp } from "./term.ts";
import { pluginManager } from "./shared.ts";
import { getCounter } from "./counter.ts";

if (import.meta.main) {
  console.log(`Acting as version ${gameConfig.version}`);

  if (serverConfig.allowPlugins) {
    console.log("loading plugins...")

    await pluginManager.loadPlugins();
  }

  const usesHttps = (httpsConfig.fullchain && httpsConfig.privkey);
  const settings = usesHttps ?
  {port: serverConfig.port, cert: await Deno.readTextFile(httpsConfig.fullchain), key: await Deno.readTextFile(httpsConfig.privkey)} : 
  {port: serverConfig.port};

  Deno.serve(settings, async (req: Request) => {
    const url = new URL(req.url);
    let path = url.pathname;
    if (path.startsWith("//")) {
      path = path.substring(1);
    }

    if (path == "/counter") {
      return new Response(await getCounter(), {
        status: 200,
        headers: {
          "content-type": "image/png; charset=binary",
        },
      });
    }
    
    const me:string = req.headers.get("me") ?? "";
    
    let session:MexpSession|null = null;
    let user:MexpUser|null = null;
    let au:boolean = false;
    
    let authPath:string = "/m/u/v";

    if (gameConfig.version == 28) {
      authPath = "/m/u/vi";
    } else if (gameConfig.version < 28) {
      authPath = "/m/vi";

      if (gameConfig.version <= 21) {
        authPath = "/gt";
      } else if (gameConfig.version <= 24) {
        authPath = "/vi";
      }
    }

    const isOnGameEndpoint:boolean = (me != "" && path != authPath);
    const isOnAuthEndpoint:boolean = (gameConfig.version >= 36 && me == "none" && (path == "/m/m/c" || path == "/m/u/c"));

    if (isOnGameEndpoint && !isOnAuthEndpoint) {
      session = getSession(me);
      if (!session) {
        if (serverConfig.extraLogging) console.log(`Session for user ${me} doesn't exist!`);
        return new Response("");
      }
      
      user = session.getUser();
      if (!user) {
        if (serverConfig.extraLogging) console.log(`User for session ${me} doesn't exist!`);
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
      const port = serverConfig.port == 80 || serverConfig.port == 443 ? '': `:${serverConfig.port}`;
      return new Response(encode(serverConfig.redirectUrl == "" ? `${serverConfig.scheme}://${serverConfig.ip}${port}/` : serverConfig.redirectUrl));
    }

    if (path == "/version/mexp") {
      return await version_mexp();
    }

    if (gameConfig.version >= 29) {
      const response = await post28Router(routingInfo);
      if (response) return response;
    }

    if (gameConfig.version == 28) {
      const response = await v28Router(routingInfo);
      if (response) return response;
    }

    if (gameConfig.version >= 25) {
      const response = await pre28Router(routingInfo);
      if (response) return response;
    }

    if (gameConfig.version <= 24) {
      const response = await pre25Router(routingInfo);
      if (response) return response;
    }
    
    console.log("====================================================")
    console.log(path);
    console.log(req.headers);
    return new Response("404");
  });

  if (serverConfig.allowTerminalCommands) {
    terminalApp();
  }
}