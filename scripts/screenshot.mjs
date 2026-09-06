/**
 * Dev QA screenshot helper — drives the installed Chrome via puppeteer-core.
 * Chrome's own --screenshot flag freezes Motion mount/in-view animations, so
 * this navigates, scrolls to trigger whileInView, lets things settle, then shoots.
 *
 * Usage: node scripts/screenshot.mjs <path> <outfile> [width] [height] [--full] [--rm]
 *   node scripts/screenshot.mjs /shirts out.png 1440 900 --full
 *   node scripts/screenshot.mjs /shirts out-mobile.png 390 844
 */
import puppeteer from "puppeteer-core";

const [pathArg, out, wArg, hArg, ...flags] = process.argv.slice(2);
const width = Number(wArg) || 1440;
const height = Number(hArg) || 900;
const fullPage = flags.includes("--full");
const reducedMotion = flags.includes("--rm");
const base = process.env.SHOT_BASE || "http://localhost:3000";

const CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
const { existsSync } = await import("node:fs");
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) throw new Error("No Chrome/Edge binary found");

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--hide-scrollbars", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
if (reducedMotion) {
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
}
await page.goto(`${base}${pathArg}`, { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await wait(400);
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await wait(180);
  }
  window.scrollTo(0, 0);
  await wait(700);
});
await page.mouse.move(2, 2); // park the custom cursor out of frame
await page.screenshot({ path: out, fullPage });
await browser.close();
console.log("shot →", out);
