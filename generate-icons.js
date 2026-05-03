/**
 * generate-icons.js
 * 生成TabSweep扩展图标（表达标签清理功能）
 * 使用Node.js内置zlib，无第三方依赖
 *
 * 设计：简洁的浏览器标签形状 + 勾号（表达"清理完成"）
 * 运行：node generate-icons.js
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// 简易PNG编码器
function createPNG(width, height, pixels) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = y * (1 + width * 4) + 1 + x * 4;
      rawData[di]     = pixels[si];
      rawData[di + 1] = pixels[si + 1];
      rawData[di + 2] = pixels[si + 2];
      rawData[di + 3] = pixels[si + 3];
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xFFFFFFFF;
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let x = n;
      for (let k = 0; k < 8; k++) x = (x & 1) ? (0xEDB88320 ^ (x >>> 1)) : (x >>> 1);
      table[n] = x;
    }
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const crcData = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([len, t, data, crc]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// 在pixel buffer上绘制图形
function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4);

  function setPixel(x, y, r, g, b, a = 255) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    const srcA = a / 255;
    const dstA = pixels[i + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA === 0) return;
    pixels[i]     = Math.round((r * srcA + pixels[i]   * dstA * (1 - srcA)) / outA);
    pixels[i + 1] = Math.round((g * srcA + pixels[i + 1] * dstA * (1 - srcA)) / outA);
    pixels[i + 2] = Math.round((b * srcA + pixels[i + 2] * dstA * (1 - srcA)) / outA);
    pixels[i + 3] = Math.round(outA * 255);
  }

  function drawCircle(cx, cy, radius, r, g, b) {
    const r2 = Math.ceil(radius + 1);
    for (let dy = -r2; dy <= r2; dy++) {
      for (let dx = -r2; dx <= r2; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
          const alpha = dist <= radius - 0.7 ? 255 : Math.max(0, Math.min(255, Math.round((radius - dist + 0.7) * 510)));
          setPixel(cx + dx, cy + dy, r, g, b, alpha);
        }
      }
    }
  }

  function drawLine(x1, y1, x2, y2, thickness, r, g, b) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(len * 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      drawCircle(x1 + dx * t, y1 + dy * t, thickness / 2, r, g, b);
    }
  }

  function drawRoundRect(x1, y1, x2, y2, radius, r, g, b) {
    // 填充圆角矩形
    for (let py = Math.floor(y1); py <= Math.ceil(y2); py++) {
      for (let px = Math.floor(x1); px <= Math.ceil(x2); px++) {
        let inside = false;
        // 判断点是否在圆角矩形内
        if (px >= x1 + radius && px <= x2 - radius) inside = true;
        if (py >= y1 + radius && py <= y2 - radius) inside = inside || (px >= x1 && px <= x2);
        // 左上圆角
        if (px < x1 + radius && py < y1 + radius) {
          inside = Math.sqrt((px - (x1 + radius)) ** 2 + (py - (y1 + radius)) ** 2) <= radius;
        }
        // 右上圆角（标签形状：斜角）
        if (px > x2 - radius * 1.5 && py < y1 + radius) {
          // 标签右上角是斜的，跳过
        } else if (px >= x2 - radius && py < y1 + radius) {
          inside = Math.sqrt((px - (x2 - radius)) ** 2 + (py - (y1 + radius)) ** 2) <= radius;
        }
        // 左下圆角
        if (px < x1 + radius && py > y2 - radius) {
          inside = Math.sqrt((px - (x1 + radius)) ** 2 + (py - (y2 - radius)) ** 2) <= radius;
        }
        // 右下圆角
        if (px > x2 - radius && py > y2 - radius) {
          inside = Math.sqrt((px - (x2 - radius)) ** 2 + (py - (y2 - radius)) ** 2) <= radius;
        }
        if (inside) setPixel(px, py, r, g, b);
      }
    }
  }

  const pad = size * 0.12;
  const x1 = pad, y1 = pad + size * 0.08;
  const x2 = size - pad, y2 = size - pad;
  const corner = size * 0.1;

  // 绘制标签形状背景（琥珀色 #FF9800）
  const bgR = 255, bgG = 152, bgB = 0;

  // 简化：直接绘制圆角矩形
  drawRoundRect(x1, y1, x2, y2, corner, bgR, bgG, bgB);

  // 绘制标签的斜角（右上）
  for (let i = 0; i < size * 0.18; i++) {
    const cutX = x2 - size * 0.18 + i;
    const cutY = y1 + (i / (size * 0.18)) * size * 0.12;
    setPixel(cutX, cutY, bgR, bgG, bgB);
  }

  // 在标签内部画勾号（白色，表达"已清理"）
  const cmx = (x1 + x2) / 2 + size * 0.05;
  const cmy = (y1 + y2) / 2;
  const armLen = size * 0.22;

  // 勾号第一条线（左下到中）
  const ax1 = cmx - armLen * 0.8, ay1 = cmy + armLen * 0.3;
  const ax2 = cmx - armLen * 0.1, ay2 = cmy + armLen * 0.5;
  drawLine(ax1, ay1, ax2, ay2, size * 0.09, 255, 255, 255);

  // 勾号第二条线（中到右上）
  const bx1 = ax2, by1 = ay2;
  const bx2 = cmx + armLen * 0.6, by2 = cmy - armLen * 0.5;
  drawLine(bx1, by1, bx2, by2, size * 0.09, 255, 255, 255);

  return pixels;
}

// 生成三个尺寸的图标
const sizes = [16, 48, 128];
const iconsDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'extension', 'icons');

try {
  fs.mkdirSync(iconsDir, { recursive: true });
} catch (e) {}

sizes.forEach(size => {
  const pixels = drawIcon(size);
  const png = createPNG(size, size, pixels);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`✓ Generated ${outPath} (${size}x${size})`);
});

console.log('\nDone! Icons generated in extension/icons/');
