import * as THREE from "three";

/* Draws the book's cover onto a canvas: brand mark + the full "OddsFinance" wordmark. */
export function makeCoverTexture() {
  const w = 900, h = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0B1437");
  bg.addColorStop(0.5, "#182463");
  bg.addColorStop(1, "#23307A");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // soft vignette for depth
  const vignette = ctx.createRadialGradient(w / 2, h * 0.42, h * 0.1, w / 2, h * 0.42, h * 0.62);
  vignette.addColorStop(0, "rgba(124,92,255,0.16)");
  vignette.addColorStop(1, "rgba(0,0,0,0.0)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // gold double-border frame ("foil stamp" look)
  ctx.strokeStyle = "rgba(240,180,41,0.65)";
  ctx.lineWidth = 7;
  ctx.strokeRect(42, 42, w - 84, h - 84);
  ctx.strokeStyle = "rgba(240,180,41,0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 64, w - 128, h - 128);
  // corner flourishes
  const cornerR = 26;
  [[64, 64], [w - 64, 64], [64, h - 64], [w - 64, h - 64]].forEach(([cx, cy]) => {
    ctx.strokeStyle = "rgba(240,180,41,0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, cornerR, 0, Math.PI * 2);
    ctx.stroke();
  });

  // brand chip with bar-chart + bell-curve mark
  const chipX = w / 2, chipY = h * 0.3, chipR = 118;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  const chipGrad = ctx.createLinearGradient(chipX - chipR, chipY - chipR, chipX + chipR, chipY + chipR);
  chipGrad.addColorStop(0, "#3B5BFF");
  chipGrad.addColorStop(1, "#7C5CFF");
  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(chipX - chipR, chipY - chipR, chipR * 2, chipR * 2, 34);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#EAEFFB";
  const barW = 24, barBaseY = chipY + chipR * 0.46;
  [[-64, 0.4], [-22, 0.65], [22, 0.5], [64, 0.8]].forEach(([dx, hMul]) => {
    const bh = chipR * hMul;
    ctx.fillRect(chipX + dx - barW / 2, barBaseY - bh, barW, bh);
  });
  ctx.strokeStyle = "#F0B429";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(chipX - chipR * 0.78, chipY + chipR * 0.1);
  ctx.quadraticCurveTo(chipX, chipY - chipR * 0.95, chipX + chipR * 0.78, chipY + chipR * 0.1);
  ctx.stroke();

  // wordmark — auto-scaled so the full "OddsFinance" always fits on one line
  const maxTextWidth = w * 0.82;
  let fontSize = 116;
  ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  while (ctx.measureText("OddsFinance").width > maxTextWidth && fontSize > 40) {
    fontSize -= 2;
    ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  }
  const oddsW = ctx.measureText("Odds").width;
  const financeW = ctx.measureText("Finance").width;
  const totalW = oddsW + financeW;
  const textY = h * 0.62;
  const startX = chipX - totalW / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#EAEFFB";
  ctx.fillText("Odds", startX, textY);
  ctx.fillStyle = "#F0B429";
  ctx.fillText("Finance", startX + oddsW, textY);
  ctx.shadowBlur = 0;

  // thin gold rule under the wordmark
  ctx.strokeStyle = "rgba(240,180,41,0.6)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(chipX - totalW * 0.32, textY + fontSize * 0.32);
  ctx.lineTo(chipX + totalW * 0.32, textY + fontSize * 0.32);
  ctx.stroke();

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
