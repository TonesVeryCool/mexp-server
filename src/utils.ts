import { config } from "./config.ts";

const flip = (data: any) => Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]));

const DecodeTable = {
    "04": "_",
    "da": "-",
    "6e": "/",
    "af": ":",
    "9a": ".",
    "86": "z",
    "d4": "y",
    "67": "x",
    "88": "w",
    "5b": "v",
    "ab": "u",
    "8b": "t",
    "4d": "s",
    "d5": "r",
    "ba": "q",
    "b7": "p",
    "52": "o",
    "cd": "n",
    "f1": "m",
    "e6": "l",
    "cc": "k",
    "ea": "j",
    "nb": "i",
    "0f": "h",
    "3e": "g",
    "23": "f",
    "a3": "e",
    "be": "d",
    "cf": "c",
    "a8": "b",
    "f9": "a",
    "b1": "9",
    "fc": "8",
    "d1": "7",
    "ff": "6",
    "6d": "5",
    "c4": "4",
    "0e": "3",
    "46": "2",
    "9d": "1",
    "20": "0"
};

const ServerEncodeTable = flip(DecodeTable);

export function encode(str: string): string
{
    let realStr:string = "";
    for (let i = 0; i < str.length; i++) {
        const curValue: string = str.at(i) ?? "";
        realStr += ServerEncodeTable[curValue];
    }
    return realStr
}

export async function getRandomFilePath(folderPath: string): Promise<string | null> {
    const filePaths: string[] = [];
    
    for await (const entry of Deno.readDir(folderPath)) {
        if (entry.isFile) {
            filePaths.push(entry.name);
        }
    }
    
    if (filePaths.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * filePaths.length);
    return filePaths[randomIndex];
}

const validity = (str: string): boolean => /^[a-z]+$/.test(str);
export const now = (): number => Math.floor(Date.now() / 1000);
export const shortenName = (me: string): string => me.substring(0, 5);
export const randf_range = (min:number, max:number) => Math.floor(Math.random() * (max - min) ) + min;

export function validateUsername(username:string, authorized:boolean): boolean {
    if (authorized) return true;

    if (username.length != 64) return false;
    if (!validity(username)) return false;

    return true;
}

export function isAuthorized(req:Request): boolean {
    const ed:string = req.headers.get("ed") ?? "0";
    const au:string = req.headers.get("au") ?? "something";

    if (ed == "1" && au == config.authorizerText) return true;

    return false;
}

export function serverLog(log:string) {
    console.log(log);
    // TODO: add webhook
}