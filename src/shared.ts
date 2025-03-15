import { EventEmitter } from "./event_emitter.ts";
import { PluginManager } from "./plugins/plugin_manager.ts";

export const shared = {
    isScreenOn: true,
}
export const sharedEvents = new EventEmitter();
export const pluginManager = new PluginManager();