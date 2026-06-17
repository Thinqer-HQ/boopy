const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function makePng(width, height, rgbaFn) {
  const idat = [];
  for (let y = 0; y < height; y++) {
    idat.push(0);
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = rgbaFn(x, y, width, height);
      idat.push(r, g, b, a);
    }
  }
  const raw = Buffer.from(idat);
  const compressed = zlib.deflateSync(raw, { level: 9 });

  function chunk(type, data) {
    const t = Buffer.from(type);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcBuf = Buffer.concat([t, data]);
    let crc = 0xffffffff;
    for (const b of crcBuf) {
      crc ^= b;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    crc = ~crc >>> 0;
    const crcOut = Buffer.alloc(4);
    crcOut.writeUInt32BE(crc);
    return Buffer.concat([len, t, data, crcOut]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const assetsDir = path.join(__dirname, "../apps/mobile/assets");

// adaptive-icon.png: solid white foreground so it's visible on the purple #6d5df6 background
const whitePng = makePng(1024, 1024, () => [255, 255, 255, 255]);
fs.writeFileSync(path.join(assetsDir, "adaptive-icon.png"), whitePng);
console.log("adaptive-icon.png: solid white 1024x1024");

// icon.png: purple background with a centered white rounded square
const iconPng = makePng(1024, 1024, (x, y) => {
  const cx = 512,
    cy = 512,
    half = 260,
    radius = 60;
  const dx = Math.abs(x - cx) - half + radius;
  const dy = Math.abs(y - cy) - half + radius;
  const dist = Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
  const inRounded = Math.max(dx, dy) <= 0 || dist <= radius;
  if (inRounded) return [255, 255, 255, 255];
  return [109, 93, 246, 255];
});
fs.writeFileSync(path.join(assetsDir, "icon.png"), iconPng);
console.log("icon.png: purple+white rounded square 1024x1024");

// splash.png: keep as full purple, just make it bigger (1284x2778)
const splashPng = makePng(1284, 2778, () => [109, 93, 246, 255]);
fs.writeFileSync(path.join(assetsDir, "splash.png"), splashPng);
console.log("splash.png: solid purple 1284x2778");
