import { assertEquals } from "jsr:@std/assert";
import { indexesToText } from "../src/speak.ts";

async function stringToSpeakIndexes(str:string): Promise<string[]> {
    const indexes:string[] = [];
    const wordList = await Deno.readTextFile("./assets/wordlist.txt");
    const wordListSplit = wordList.split(" ");

    const stringSplit = str.split(" ");
    for (const string of stringSplit) {
        indexes.push(wordListSplit.indexOf(string).toString())
    }

    return indexes
}

async function outputFromString(str:string): Promise<string> {
    return await indexesToText(await stringToSpeakIndexes(str));
}

Deno.test("speak accuracy - string mixing - s/d/ed", async () => {
    assertEquals(await outputFromString("s s s s s"), "ss ss s");
    assertEquals(await outputFromString("d d d d d"), "dd dd d");
    assertEquals(await outputFromString("ed ed ed ed ed"), "eded eded ed");
})

Deno.test("speak accuracy - string mixing - ing/'s/'ll/ly", async () => {
    assertEquals(await outputFromString("ing ing ing ing ing"), "inginginginging");
    assertEquals(await outputFromString("'s 's 's 's 's"), "'s's's's's");
    assertEquals(await outputFromString("'ll 'll 'll 'll 'll"), "'ll'll'll'll'll");
    assertEquals(await outputFromString("ly ly ly ly ly"), "lylylylyly");
})

Deno.test("speak accuracy - string mixing - un", async () => {
    assertEquals(await outputFromString("un test un test"), "un test untest");
    assertEquals(await outputFromString("un un un un un"), "un unun unun");
})

Deno.test("speak accuracy - string mixing - punctuation", async () => {
    assertEquals(await outputFromString(". . . . ."), ".....");
    assertEquals(await outputFromString("test ing . . . !"), "testing...!");
    assertEquals(await outputFromString("hello ! ! ! ? !"), "hello!!!?!");
    assertEquals(await outputFromString("test ing : hi"), "testing:hi");
    assertEquals(await outputFromString("game version : 3 8"), "game version:3 8");
})

Deno.test("speak accuracy - string mixing - numbers", async () => {
    assertEquals(await outputFromString("1 2 3 4 5 6 7 8 9"), "1 2 3 4 5 6 7 8 9");
    assertEquals(await outputFromString("1 0 out of 2 5"), "1 0 out of 2 5");
    assertEquals(await outputFromString("1 0 / 2 5"), "1 0 / 2 5");
})