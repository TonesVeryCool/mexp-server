import { termState } from "../term.ts";
import { adminConsoleLog } from "../utils.ts";

export function execute(args:string[]) {
    if (args.length < 2) {
        adminConsoleLog(`usage: tk || givetoken [token]`);
        return;
    }

    if (!termState.selectedUser) {
        adminConsoleLog(`usage: tk || givetoken [token]\nerror: you don't have any user selected! please run the "sel" command!`);
        return;
    }

    const token = args[1];

    termState.selectedUser.legitTokens = `${termState.selectedUser.legitTokens} ${token}`.trimStart();
    termState.selectedUser.commit();
    
    adminConsoleLog(`given token ${token} to ${termState.selectedUser.username}`);
}