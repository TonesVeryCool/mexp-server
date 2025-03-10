import { gameConfig } from "./config.ts";

export class SpeakMessage {
    username:string = "_edit";
    message:string = "hello world ";
}

export const chatMessages:SpeakMessage[] = []

export async function indexesToText(str:string[]) {
    let final:string = "";
    const wordList = await Deno.readTextFile("./assets/wordlist.txt");
    const wordListSplit = wordList.split(" ");

    let lastWord = "";
    let linkAmount = 0;
    let i = 0;

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
                if (word == "s" || word == "ing" || word == "ed" || word == "d" || word == "." || word == "," || word == ":" || lastWord == ":" || word == "!" || word == "?" || word == "'s" || word == "'ll" || word == "ly" || (lastWord == "un" && i > 1))
                {
                    if (linkAmount == 2 && (word == "s" || word == "ed" || word == "d" || word == "un")) {
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
                    linkAmount = (lastWord == "un" ? 1 : 0);
                }
                lastWord = word;
            }
        } catch (_err) {
            final += " ";
            lastWord = "";
        }
        ++i;
    }

    if (gameConfig.version < 30) final += " "; // not actually how pre-30 mexp did it, but my speak implementation is superior and it doesn't have the stupid bug so i have to do it like this
    return final.trimStart();
}

export const lastMessageFrom = (me:string) => chatMessages.findLast(msg => msg.username === me)?.message.split(" ").join("@") ?? "";