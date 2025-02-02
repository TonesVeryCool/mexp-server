import { createCanvas } from "https://raw.githubusercontent.com/DjDeveloperr/deno-canvas/master/mod.ts";
import { randf_range, randomString } from "./utils.ts";

const shuffleString = (str: string): { 
    shuffled: string, 
    order: number[] 
} => {
    const chars = str.split('').map((char, index) => ({ char, index }));
    
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    return {
        shuffled: chars.map(c => c.char).join(''),
        order: chars.map(c => c.index)
    };
}

export class Captcha {
    answer:string = "";
    invalidationTimer:number = 0;
    
    constructor() {
        this.resetTimer();
        this.answer = randomString(8);
    }

    public generateImage() {
        console.log(this.answer);
        const canvas = createCanvas(200, 100);
        const ctx = canvas.getContext("2d");

        const gradient = ctx.createLinearGradient(0, 0, 200, 100);
        gradient.addColorStop(0, "#602bad"); // Start color
        gradient.addColorStop(1, "#3d1c6e"); // End color

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 200, 100);

        for (let i = 0; i < 10; i++) {
            const x0 = randf_range(0, 200);
            const y0 = randf_range(0, 100);
            const r = randf_range(0.15, 16);
            ctx.fillStyle = `rgba(255, 255, 255, ${randf_range(0.05, 0.8)})`;

            ctx.beginPath();
            ctx.arc(x0, y0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const randomChars = randomString(64);
        for (const char of randomChars)
        {
            ctx.font = "20px sans-serif";
            ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;

            const x = randf_range(0, 200);
            const y = randf_range(0, 100);

            ctx.fillText(char, x, y);
        }

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const x0 = randf_range(-40, 240);
            const y0 = randf_range(-40, 0);
            const x1 = randf_range(-40, 240);
            const y1 = randf_range(100, 140);
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.closePath();
            ctx.stroke();
        }

        const shuffledAnswer = shuffleString(this.answer);
        let j = 0;
        for (const character of shuffledAnswer.shuffled)
        {
            const restColor = randf_range(130, 255);
            ctx.font = "20px sans-serif";
            ctx.fillStyle = `rgba(${restColor}, ${restColor}, ${restColor}, ${randf_range(0.55, 0.8)})`;

            const x = (200 / 4) * (j % 4) + 15 + randf_range(-5, 5);
            const y = (100 / 2) * Math.floor(j / 4) + 30 + randf_range(-5, 5);

            ctx.fillText(character, x, y);

            const characterIndex = shuffledAnswer.order[j] + 1;
            ctx.font = "10px sans-serif";
            ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
            ctx.fillText(characterIndex.toString(), x + 15, y - 15);
            j++;
        }

        return canvas.toBuffer();
    }
    
    public resetTimer() {
        if (this.invalidationTimer) clearTimeout(this.invalidationTimer);
        
        this.invalidationTimer = setTimeout(() => {
            const index = captchas.indexOf(this);
            if (index > -1) captchas.splice(index, 1);
        }, 1000 * 60 * 1);
    }
    
    destroy() {
        clearTimeout(this.invalidationTimer);
    }
}

export const captchas:Captcha[] = [];