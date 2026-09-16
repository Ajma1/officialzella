import fs from "node:fs";
import path from "node:path";

const RESULTS_DIR =
  "C:\\Users\\ajmal\\.claude\\projects\\C--Users-ajmal-Junaid-officialzella\\59263b59-1ada-45a9-87f8-9ba736837c3f\\tool-results";
const OUT_DIR = path.join(import.meta.dirname, "..", "media-staging");

const MAP = {
  "toolu_018JNYu9a5xC97EfFUcjXg4C.txt": "b02.jpeg",
  "toolu_01Pgp2MZAQoMiQVsMnSESdt4.txt": "b04.jpeg",
  "toolu_01FTcFfDEwGenK7DoAjLBJUF.txt": "e10.jpeg",
  "toolu_0118hKMZCGyQmK68aBaD6g4y.txt": "e01.jpeg",
  "toolu_016xdEBuFMvbZ5GJhnXi7iDD.txt": "a01.jpeg",
  "toolu_01ArTsGvGv54o6or7QTR6n5a.txt": "d04.jpeg",
  "toolu_01Si1Cg1HK3NkEGkvdTdjU6d.txt": "c01.jpeg",
  "toolu_01EgW59mRDL15az1AGaPAyQP.txt": "c02.jpeg",
  "toolu_014mLdzTBKUVVejAiACkxQVM.txt": "f01.jpeg",
  "toolu_01WQM9gL3hxhVtKLoTMR1PnD.txt": "f04.jpeg",
  "toolu_01UEddHKH3R4jV2rUprDuZMb.txt": "a15.jpeg",
  "toolu_01PED4h9sVsxAAZ49p6ZdYhm.txt": "b09.jpeg",
  "toolu_01F5XxgnzFJG1xCFKDS1RREw.txt": "b07.jpeg",
  "toolu_01Lhh1guEMZZo38XYrknybYb.txt": "b08.jpeg",
  "toolu_01Qhqzzdu3ABm5YUSeGNRGU4.txt": "b10.jpeg",
  "toolu_01NGoapN2QvNWTJrwvwMv4qB.txt": "b01.jpeg",
};

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [resultFile, outName] of Object.entries(MAP)) {
  const raw = fs.readFileSync(path.join(RESULTS_DIR, resultFile), "utf8");
  const parsed = JSON.parse(raw);
  const buf = Buffer.from(parsed.content, "base64");
  fs.writeFileSync(path.join(OUT_DIR, outName), buf);
  console.log(`${outName}: ${buf.length} bytes`);
}
