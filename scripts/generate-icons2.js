import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const iconDir = path.join(__dirname, "../icons");

if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

async function generateIcons() {
    for (const size of sizes) {

        // Voyager star icon concept
        const svgString = `<svg width="${size}" height="${size}" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="128" height="128" rx="28" fill="url(#paint0_linear)"/>
<path d="M64 24C64 46.0914 46.0914 64 24 64C46.0914 64 64 81.9086 64 104C64 81.9086 81.9086 64 104 64C81.9086 64 64 46.0914 64 24Z" fill="white"/>
<circle cx="64" cy="64" r="12" fill="#10a37f"/>
<defs>
<linearGradient id="paint0_linear" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
<stop stop-color="#10a37f"/>
<stop offset="1" stop-color="#065f46"/>
</linearGradient>
</defs>
</svg>`;

        const buffer = Buffer.from(svgString);
        await sharp(buffer)
            .png()
            .toFile(path.join(iconDir, `icon${size}.png`));
        console.log(`Created icon${size}.png`);
    }
}

generateIcons().catch(console.error);
