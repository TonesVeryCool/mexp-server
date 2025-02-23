import { termState } from "../term.ts";
import { adminConsoleLog } from "../utils.ts";

export function execute(_args:string[]) {
    if (termState.selectedUser == null) {
        adminConsoleLog(`usage: desel\nerror: you don't have any user selected!`);
        return;
    }

    termState.selectedUser = null;
    adminConsoleLog(`deselected user`);
}