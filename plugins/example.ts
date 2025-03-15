import { EventType } from "../src/event_emitter.ts";
import { Plugin } from "../src/plugins/plugin.ts";
import { PluginUtils } from "../src/plugins/plugin_utils.ts";
import { MexpPosition, MexpSession, MexpUser } from "../src/user.ts";

const examplePlugin:Plugin = {
    unique: "sh.mexpserver.example",
    name: "Example Plugin",
    version: "1.0.0",
    enabled: true,
    onLoad() {
        console.log("hey!");
    },
    onUnload() {
        console.log("bye...");
    },
    registerHooks() {
        PluginUtils.hook(this, EventType.SessionStarted, (user:MexpUser, _session:MexpSession) => {
            PluginUtils.speak("SYSTEM", `hello ${user.username}!!!`);
        });

        PluginUtils.hook(this, EventType.SessionDisconnected, (session:MexpSession) => {
            PluginUtils.speak("SYSTEM", `goodbye ${session.getUser()?.username}...`);
        });

        PluginUtils.hook(this, EventType.SpeakMessage, (user:MexpUser, message:string) => {
            if (message == "/ hell") {
                PluginUtils.speak("SYSTEM", `sending ${user.username} to map_hell`);
                PluginUtils.teleport(user, "map_hell");
            }
        });

        PluginUtils.hook(this, EventType.TokenObtained, (user:MexpUser, legit:boolean, token:string) => {
            PluginUtils.speak("SYSTEM", `${user.username} got a ${legit ? "legit" : "cheated"} token: ${token}`);
        });

        PluginUtils.hook(this, EventType.ScreenToggled, (user:MexpUser, state:boolean) => {
            PluginUtils.speak("SYSTEM", `${user.username} turned the theater screen ${state ? "on" : "off"}`);
        });

        PluginUtils.hook(this, EventType.GhostMoved, (user:MexpUser, coords:MexpPosition) => {
            if (coords.y > 90) {
                PluginUtils.speak("SYSTEM", `${user.username} is at y 90!!!! kicking to hell`);
                PluginUtils.teleport(user, "map_hell");
            }
        });

        PluginUtils.hook(this, EventType.MapLoaded, (user:MexpUser, map:string, _coords:MexpPosition) => {
            if (map == "map_hell") {
                PluginUtils.speak("SYSTEM", `welcome ${user.username} to HELL...`);
            }
        });
    }
}

export default examplePlugin;