// Script to create placeholder icons using canvas
// Run with: node scripts/generate-icons.cjs

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const sizes = [16, 32, 48, 128];

// Create icons directory if it doesn't exist
const iconDir = path.join(__dirname, "../icons");
if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

sizes.forEach((size) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#10a37f");
    grad.addColorStop(1, "#065f46");
    ctx.fillStyle = grad;

    // Rounded rectangle
    const r = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    // Rocket emoji
    ctx.font = `${size * 0.6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🚀", size / 2, size / 2 + 1);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path.join(iconDir, `icon${size}.png`), buffer);
    console.log(`Created icon${size}.png`);
});
