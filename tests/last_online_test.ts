import { assertEquals } from "jsr:@std/assert";
import { timeSinceLastOnline } from "../src/utils.ts";

Deno.test("date accuracy - seconds", () => {
    assertEquals(timeSinceLastOnline(0), "just now");
    assertEquals(timeSinceLastOnline(1), "just now");
})

Deno.test("date accuracy - minutes", () => {
    assertEquals(timeSinceLastOnline(60), "60 seconds ago");
    assertEquals(timeSinceLastOnline(90), "60 seconds ago");
    assertEquals(timeSinceLastOnline(60 * 2), "2 minutes ago");
})

Deno.test("date accuracy - hours", () => {
    assertEquals(timeSinceLastOnline(60 * 60), "60 minutes ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 1.5), "60 minutes ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 2), "2 hours ago");
})

Deno.test("date accuracy - days", () => {
    assertEquals(timeSinceLastOnline(60 * 60 * 24), "24 hours ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 25), "24 hours ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 46), "24 hours ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 48), "2 days ago");
})

Deno.test("date accuracy - weeks", () => {
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7), "7 days ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 13), "7 days ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 14), "2 weeks ago");
})

Deno.test("date accuracy - months", () => {
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 4), "4 weeks ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 5), "4 weeks ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 7), "4 weeks ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 8), "2 months ago");
})

Deno.test("date accuracy - years", () => {
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 4 * 12), "12 months ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 4 * 13), "12 months ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 4 * 23), "12 months ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 4 * 24), "2 years ago");
})

Deno.test("date accuracy - decades", () => {
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 4 * 12 * 10), "10 years ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 4 * 12 * 19), "10 years ago");
    assertEquals(timeSinceLastOnline(60 * 60 * 24 * 7 * 4 * 12 * 20), "2 decades ago");
    assertEquals(timeSinceLastOnline(1741381992), "6 decades ago");
})