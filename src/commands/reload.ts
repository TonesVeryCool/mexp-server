import { pluginManager } from "../shared.ts";
import { adminConsoleLog } from "../utils.ts";

export async function execute(args:string[]) {
    if (args.length != 1) {
        adminConsoleLog("usage: reload");
    } else {
        adminConsoleLog("reloading plugins...");
        pluginManager.unloadPlugins();
        await pluginManager.loadPlugins();
        adminConsoleLog("reloaded plugins!");
    }
}