import { getPlayer } from "../db.ts";
import { termState } from "../term.ts";
import { adminConsoleLog } from "../utils.ts";

export function execute(args:string[]) {
    if (args.length != 2) {
        adminConsoleLog("usage: sel [uname]");
    } else {
        const user = args[1];
        if (user.length != 5) {
            adminConsoleLog("usage: sel [uname]\nerror: [uname] has to be 5 characters long!");
            return;
        }

        const player = getPlayer(user, true, true);
        if (!player) {
            adminConsoleLog("usage: sel [uname]\nerror: user under the name [uname] doesn't exist!");
            return;
        }

        if (termState.selectedUser != null) {
            adminConsoleLog(`usage: sel [uname]\nerror: an user is already selected (${termState.selectedUser.username})! please run the "desel" command!`);
            return;
        }

        termState.selectedUser = player;
        adminConsoleLog(`selected user ${user} for next actions`);
    }
}