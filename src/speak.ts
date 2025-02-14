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
    let linkAmount = 0;
    for (const idxString of str) {
        try {
            const idxNumber = Number.parseInt(idxString);

            if (idxNumber >= wordListSplit.length) {
                final += "undefined ";
                lastWord = "undefined";
            } else if (idxNumber < 0) {
                final += " ";
                lastWord = "";
            } else {
                const word = wordListSplit[idxNumber];
                if (word != lastWord) {
                    linkAmount = 0;
                }
                if (word == "s" || word == "ing" || word == "ed" || word == "d" || word == "." || word == "," || word == ":" || word == "!" || word == "?" || word == "'s" || word == "'ll" || (lastWord == "un" && (word == "follow")))
                {
                    if (linkAmount == 2 && (word == "s" || word == "ed" || word == "d")) {
                        final += ` ${word}`;
                        linkAmount = 1;
                    } else {
                        final += `${word}`;
                        linkAmount++;
                    }
                }
                else
                {
                    final += ` ${word}`;
                    linkAmount = 0;
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

export const lastMessageFrom = (me:string) => chatMessages.findLast(msg => msg.username === me)?.message.split(" ").join("@") ?? "@";