import { createCanvas } from "https://raw.githubusercontent.com/DjDeveloperr/deno-canvas/master/mod.ts";

export async function getCounter() {
    const canvas = createCanvas(240, 80);
    const ctx = canvas.getContext("2d");
    
    canvas.loadFont(await Deno.readFile("./assets/fonts/arial-black.ttf"), { family: 'Arial Black' });
    canvas.loadFont(await Deno.readFile("./assets/fonts/arial.ttf"), { family: 'Arial Regular' });

    const number = "00003543";
    
    const evenGradient = ctx.createLinearGradient(0, 30, 0, 80);
    evenGradient.addColorStop(0, "#600080");
    evenGradient.addColorStop(1, "#300040");

    const oddGradient = ctx.createLinearGradient(0, 30, 0, 80);
    oddGradient.addColorStop(0, "#300040");
    oddGradient.addColorStop(1, "#600080");

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "20px Arial Regular";
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = `#ffffff`;
    const dateText = "Counter begins 18/01/24"
    ctx.fillText(dateText, 8, 22);

    ctx.imageSmoothingEnabled = true;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "39px Arial Black";

    for (let i = 0; i < 8; i++) {
        const char = number[i];
        const num = +char;

        ctx.fillStyle = num % 2 == 0 ? evenGradient : oddGradient;
        ctx.fillRect(i * 30, 30, 30, 50);

        const x = (i * 30) + 2;
        const y = 69;

        const shadowOffsetX = 0.5;
        const shadowOffsetY = 0.5;

        ctx.fillStyle = `rgba(0, 0, 0, 0.5)`;
        ctx.fillText(char, x + shadowOffsetX, y + shadowOffsetY);
        ctx.fillStyle = `#600080`;
        ctx.fillText(char, x, y);
    }

    return canvas.toBuffer();
}