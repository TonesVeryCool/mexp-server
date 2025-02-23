import { getPlayer } from "../db.ts";
import { termState } from "../term.ts";
import { adminConsoleLog } from "../utils.ts";

export function execute(args:string[]) {
    if (args.length == 1) {
        if (!termState.selectedUser) {
            adminConsoleLog(`usage: unban || unban [uname]\nerror: you don't have any user selected! please run the "sel" command or use "unban" with an argument!`);
            return;
        }

        termState.selectedUser.banned = false;
        termState.selectedUser.commit();
    } else {
        const user = args[1];
        if (user.length != 5) {
            adminConsoleLog("usage: unban || unban [uname]\nerror: [uname] has to be 5 characters long!");
            return;
        }

        const player = getPlayer(user, true, true);
        if (!player) {
            adminConsoleLog("usage: unban || unban [uname]\nerror: user under the name [uname] doesn't exist!");
            return;
        }

        player.banned = false;
        player.commit();
    }
}