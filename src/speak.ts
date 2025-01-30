import { shortenName } from "./utils.ts";

export class SpeakMessage {
    username:string = "_editor";
    message:string = "hello world ";
}

export const chatMessages:SpeakMessage[] = []

export async function indexesToText(str:string[]) {
    let final:string = "";
    const wordList = await Deno.readTextFile("./assets/wordlist.txt");
    console.log(wordList);
    console.log(str.join(" "));
    const wordListSplit = wordList.split(" ");

    for (const idxString of str) {
        try {
            const idxNumber = Number.parseInt(idxString);

            if (idxNumber >= wordListSplit.length || idxNumber < 0) {
                final += "undefined ";
            } else {
                const word = wordListSplit[idxNumber];
                if (word == "s" || word == "un" || word == "ing" || word == "ed")
                {
                    final += `${word}`;
                }
                else
                {
                    final += ` ${word}`;
                }
            }
        } catch (err) {
            final += " ";
        }
    }

    return final.trim();
}

export const lastMessageFrom = (me:string) => chatMessages.findLast(msg => msg.username === shortenName(me))?.message.split(" ").join("@") ?? "@";