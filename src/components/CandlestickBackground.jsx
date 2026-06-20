import { useEffect, useRef } from "react";

/*
  Animated candlestick chart background.
  Candles are continuously generated on the right and scroll left forever,
  evolving via a mean-reverting random walk. Warm palette (red grid, gold/orange
  candles, dark backdrop) echoing a live trading terminal.
*/
export default function CandlestickBackground({ style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const spacing = 26;   // px between candle centers
    const bodyW = 12;
    const speed = 0.45;   // px per frame scroll-left

    let candles = [];     // { o, c, h, l }  normalized 0..1 price space
    let price = 0.5;
    let offset = 0;       // sub-spacing scroll accumulator
    let rafId, lastT = 0;

    const rand = () => Math.random();

    function genCandle() {
      const o = price;
      // mean-reverting walk so it stays on screen, with occasional bursts
      const drift = (0.5 - price) * 0.06;
      const vol = 0.05 + rand() * 0.06;
      let c = o + drift + (rand() - 0.5) * vol * 2;
      c = Math.max(0.06, Math.min(0.94, c));
      const wick = 0.01 + rand() * 0.05;
      const h = Math.min(0.98, Math.max(o, c) + wick * rand());
      const l = Math.max(0.02, Math.min(o, c) - wick * rand());
      price = c;
      return { o, c, h, l };
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const need = Math.ceil(width / spacing) + 4;
      while (candles.length < need) candles.push(genCandle());
    }

    function priceToY(p) {
      const pad = height * 0.12;
      return height - pad - p * (height - pad * 2);
    }

    function drawGrid() {
      // warm dark backdrop with a glow toward upper-right
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#1a0805");
      grad.addColorStop(0.55, "#2a0a08");
      grad.addColorStop(1, "#120403");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(width * 0.72, height * 0.35, 0, width * 0.72, height * 0.35, width * 0.6);
      glow.addColorStop(0, "rgba(255,140,40,0.22)");
      glow.addColorStop(1, "rgba(255,80,30,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255,70,40,0.14)";
      ctx.lineWidth = 1;
      const gx = 64;
      for (let x = -(offset % gx); x < width; x += gx) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gx) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    }

    function render(t) {
      const dt = lastT ? Math.min((t - lastT) / 16.67, 3) : 1;
      lastT = t;
      offset += speed * dt;
      while (offset >= spacing) {
        offset -= spacing;
        candles.shift();
        candles.push(genCandle());
      }

      drawGrid();

      for (let i = 0; i < candles.length; i++) {
        const cd = candles[i];
        const x = i * spacing - offset + spacing;
        const up = cd.c >= cd.o;
        const color = up ? "#F4C020" : "#FF5230";
        const yo = priceToY(cd.o), yc = priceToY(cd.c);
        const yh = priceToY(cd.h), yl = priceToY(cd.l);

        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x, yh); ctx.lineTo(x, yl); ctx.stroke();

        const top = Math.min(yo, yc);
        const bh = Math.max(2, Math.abs(yc - yo));
        ctx.shadowColor = color;
        ctx.shadowBlur = up ? 14 : 8;
        ctx.fillStyle = color;
        ctx.globalAlpha = up ? 0.95 : 0.85;
        ctx.fillRect(x - bodyW / 2, top, bodyW, bh);
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(render);
    }

    const ro = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); resize(); };
    resize();
    window.addEventListener("resize", ro);
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", ro);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", ...style }}
    />
  );
}
