import { shortenName } from "./utils.ts";

export class SpeakMessage {
    username:string = "_editor";
    message:string = "hello world ";
}

export const chatMessages:SpeakMessage[] = []

export async function indexesToText(str:string[]) {
    let final:string = "";
    const wordList = await Deno.readTextFile("./assets/wordlist.txt");
    const wordListSplit = wordList.split(" ");

    let lastWord = "";
    for (const idxString of str) {
        try {
            const idxNumber = Number.parseInt(idxString);

            if (idxNumber >= wordListSplit.length || idxNumber < 0) {
                final += "undefined ";
                lastWord = "undefined";
            } else {
                const word = wordListSplit[idxNumber];
                if (word == "s" || word == "ing" || word == "ed" || word == "." || word == "," || word == ":" || word == "!" || word == "?" || word == "'s" || word == "'ll" || lastWord == "un")
                {
                    final += `${word}`;
                }
                else
                {
                    final += ` ${word}`;
                }
                lastWord = word;
            }
        } catch (_err) {
            final += " ";
            lastWord = "";
        }
    }

    return final.trim();
}

export const lastMessageFrom = (me:string) => chatMessages.findLast(msg => msg.username === shortenName(me))?.message.split(" ").join("@") ?? "@";