import { sharedEvents } from "../shared.ts";
import { getAllPaths } from "../utils.ts";
import { Plugin } from "./plugin.ts";

export class PluginManager {
    private plugins: Plugin[] = [];
    constructor() {}
    
    async loadPlugins() {
        for (const path of await getAllPaths("./plugins", true)) {
            try {
                const module = await import(`${path}?t=${Date.now()}`);
                if (module.default) {
                    const plugin: Plugin = module.default;
                    if (!plugin.enabled) {
                        console.log(`Skipping plugin: ${plugin.name} (${plugin.version}), as it is disabled.`);
                        continue;
                    }
                    plugin.onLoad();
                    if (plugin.registerHooks) {
                        plugin.registerHooks();
                    }
                    this.plugins.push(plugin);
                    console.log(`Loaded plugin: ${plugin.name} (${plugin.version})`);
                }
            } catch (error) {
                console.error(`Failed to load plugin at ${path}:`, error);
            }
        }
    }
    
    unloadPlugins() {
        for (const plugin of this.plugins) {
            plugin.onUnload();
            sharedEvents.unhook(plugin.unique);
            console.log(`Unloaded plugin: ${plugin.name}`);

            const index = this.plugins.indexOf(plugin);
            if (index > -1) this.plugins.splice(index, 1);
        }
    }
}