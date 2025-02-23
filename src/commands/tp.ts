import { termState } from "../term.ts";
import { adminConsoleLog } from "../utils.ts";

export function execute(args:string[]) {
    if (args.length < 2) {
        adminConsoleLog(`usage: tp [map] {x} {y} {z} {r}`);
        return;
    }

    if (!termState.selectedUser) {
        adminConsoleLog(`usage: tp [map] {x} {y} {z} {r}\nerror: you don't have any user selected! please run the "sel" command!`);
        return;
    }

    const map = args[1];
    const x = args[2] ?? "0";
    const y = args[3] ?? "0.9";
    const z = args[4] ?? "0";
    const r = args[5] ?? "0";

    const spawnData = `${map} ${x} ${y} ${z} ${r}`;

    termState.selectedUser.lastSpawnData = spawnData;
    termState.selectedUser.commit();
    
    adminConsoleLog(`teleported ${termState.selectedUser.username} to ${map} (${spawnData})`);
}