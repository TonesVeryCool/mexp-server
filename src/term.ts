import { MexpUser } from "./user.ts";

import { execute as sel } from "./commands/sel.ts";
import { execute as desel } from "./commands/desel.ts";
import { execute as ban } from "./commands/ban.ts";
import { execute as unban } from "./commands/unban.ts";
import { execute as tp } from "./commands/tp.ts";
import { execute as reload } from "./commands/reload.ts";
import { adminConsoleLog } from "./utils.ts";

export class TermState {
    selectedUser?:MexpUser|null;
}

export const termState:TermState = new TermState();

export async function terminalApp() {
    await Deno.stdout.write(new TextEncoder().encode("> "));
    for await (const line of Deno.stdin.readable.pipeThrough(new TextDecoderStream())) {
        const args = line.trim().split(" ");
        const command = args[0];
        
        switch (command) {
            case "exit": {
                adminConsoleLog("exiting");
                Deno.exit(0);
                break;
            }
            case "clear": {
                console.clear();
                break;
            }
            case "ping": {
                adminConsoleLog("pong!");
                break;
            }
            case "sel": {
                sel(args);
                break;
            }
            case "desel": {
                desel(args);
                break;
            }
            case "ban": {
                ban(args);
                break;
            }
            case "unban": {
                unban(args);
                break;
            }
            case "tp": {
                tp(args);
                break;
            }
            case "reload": {
                await reload(args);
                break;
            }
        }

        await Deno.stdout.write(new TextEncoder().encode("> "));
    }
}
