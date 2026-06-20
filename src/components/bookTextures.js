import * as THREE from "three";

/* Draws the book's cover onto a canvas: brand mark + "OddsFinance" wordmark. */
export function makeCoverTexture() {
  const w = 768, h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0B1437");
  bg.addColorStop(0.55, "#16225C");
  bg.addColorStop(1, "#1F2E78");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // inner border frames
  ctx.strokeStyle = "rgba(240,180,41,0.55)";
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, w - 72, h - 72);
  ctx.strokeStyle = "rgba(124,92,255,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(54, 54, w - 108, h - 108);

  // brand chip with bar-chart + bell-curve mark
  const chipX = w / 2, chipY = h * 0.36, chipR = 110;
  const chipGrad = ctx.createLinearGradient(chipX - chipR, chipY - chipR, chipX + chipR, chipY + chipR);
  chipGrad.addColorStop(0, "#3B5BFF");
  chipGrad.addColorStop(1, "#7C5CFF");
  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(chipX - chipR, chipY - chipR, chipR * 2, chipR * 2, 32);
  ctx.fill();

  ctx.fillStyle = "#EAEFFB";
  const barW = 22, barBaseY = chipY + chipR * 0.45;
  [[-60, 0.4], [-20, 0.65], [20, 0.5], [60, 0.8]].forEach(([dx, hMul]) => {
    const bh = chipR * hMul;
    ctx.fillRect(chipX + dx - barW / 2, barBaseY - bh, barW, bh);
  });
  ctx.strokeStyle = "#F0B429";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(chipX - chipR * 0.75, chipY + chipR * 0.1);
  ctx.quadraticCurveTo(chipX, chipY - chipR * 0.9, chipX + chipR * 0.75, chipY + chipR * 0.1);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#EAEFFB";
  ctx.font = "700 92px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Odds", chipX - 5, h * 0.6, w * 0.8);
  const oddsWidth = ctx.measureText("Odds").width;
  ctx.fillStyle = "#F0B429";
  ctx.font = "800 92px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Finance", chipX - 5 + oddsWidth / 2 + ctx.measureText("Finance").width / 2, h * 0.6, w * 0.8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/* Cream page-stripe texture for the book's pages/edges. */
export function makePagesTexture() {
  const w = 64, h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#F4EFE2";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(120,110,80,0.25)";
  ctx.lineWidth = 1;
  for (let y = 4; y < h; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/* Inner left/right page spread shown when the book is open. */
export function makeInnerPageTexture() {
  const w = 1024, h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#F7F2E6";
  ctx.fillRect(0, 0, w, h);

  // faint ruled text lines
  ctx.strokeStyle = "rgba(120,110,80,0.18)";
  ctx.lineWidth = 2;
  for (let y = 140; y < h - 90; y += 46) {
    ctx.beginPath();
    ctx.moveTo(90, y);
    ctx.lineTo(w - 90, y);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#1F2E78";
  ctx.font = "700 74px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("OddsFinance", w / 2, 110);
  ctx.fillStyle = "rgba(31,46,120,0.55)";
  ctx.font = "500 34px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("CFA Level 1", w / 2, h - 60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
