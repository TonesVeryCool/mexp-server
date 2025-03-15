// deno-lint-ignore-file no-explicit-any
import { speakConfig } from "../config.ts";
import { EventType } from "../event_emitter.ts";
import { sharedEvents } from "../shared.ts";
import { chatMessages, SpeakMessage } from "../speak.ts";
import { MexpPosition, MexpUser } from "../user.ts";
import { serverConsoleLog, serverLog } from "../utils.ts";
import { Plugin } from "./plugin.ts";

type EventHandler = (...args: any[]) => void;

export class PluginUtils {
    static hook(plugin:Plugin, event:EventType, handler:EventHandler) {
        sharedEvents.on(plugin.unique, event, handler);
    }

    static teleport(user:MexpUser, mapName:string, coordinates:MexpPosition = new MexpPosition()): void {
        user.lastSpawnData = `${mapName} ${coordinates.str()}`;
        user.commit();
    }
    
    static speak(user:string, message:string, sendToWebhook:boolean = true): void {
        const chatMessage:SpeakMessage = new SpeakMessage();
        chatMessage.username = user;
        chatMessage.message = message;
        
        if (sendToWebhook) {
            serverLog(`\`${chatMessage.username}: ${chatMessage.message}\``, false);
        }
        serverConsoleLog(`${chatMessage.username} "${chatMessage.message}"`);
        
        if (!speakConfig.speakEnabled) return;
        
        chatMessages.push(chatMessage);
        
        if (chatMessages.length > 25) {
            chatMessages.shift();
        }
    }
    
    static ban(user:MexpUser): void {
        PluginUtils.setBanned(user, true);
    }
    
    static unban(user:MexpUser): void {
        PluginUtils.setBanned(user, false);
    }
    
    private static setBanned(user:MexpUser, banned:boolean): void {
        user.banned = banned;
        user.commit();
    }
}