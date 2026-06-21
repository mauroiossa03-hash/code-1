import { useEffect, useRef } from "react";

/*
  Animated candlestick chart background.
  Candles are continuously generated on the right and scroll left forever,
  evolving via a mean-reverting random walk. Uses the app's own "Aurora Glass"
  light palette (off-white canvas, indigo/violet grid, green/red candles).
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
      // weaker mean-reversion + wider swings so price travels much further up/down
      const drift = (0.5 - price) * 0.025;
      const vol = 0.08 + rand() * 0.22;
      let c = o + drift + (rand() - 0.5) * vol * 2;
      c = Math.max(0.04, Math.min(0.96, c));
      // body and wicks sized independently and randomly (some tiny, some huge)
      const wickUp = rand() * rand() * 0.22;
      const wickDown = rand() * rand() * 0.22;
      const h = Math.min(0.99, Math.max(o, c) + wickUp);
      const l = Math.max(0.01, Math.min(o, c) - wickDown);
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

    function drawGrid(t) {
      // light Aurora Glass backdrop — base gradient slowly breathes
      const wobble = Math.sin(t * 0.00018) * 0.5 + 0.5;
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#EAEFFB");
      grad.addColorStop(0.5 + wobble * 0.1, "#F2F6FE");
      grad.addColorStop(1, "#FFFFFF");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // two drifting indigo/violet glows so the backdrop keeps moving, not just the candles
      const gx1 = width * (0.5 + Math.sin(t * 0.00021) * 0.28);
      const gy1 = height * (0.35 + Math.cos(t * 0.00017) * 0.18);
      const glow1 = ctx.createRadialGradient(gx1, gy1, 0, gx1, gy1, width * 0.55);
      glow1.addColorStop(0, "rgba(59,91,255,0.14)");
      glow1.addColorStop(1, "rgba(59,91,255,0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const gx2 = width * (0.5 + Math.cos(t * 0.00013 + 2) * 0.32);
      const gy2 = height * (0.65 + Math.sin(t * 0.00019 + 1) * 0.2);
      const glow2 = ctx.createRadialGradient(gx2, gy2, 0, gx2, gy2, width * 0.4);
      glow2.addColorStop(0, "rgba(124,92,255,0.12)");
      glow2.addColorStop(1, "rgba(124,92,255,0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(60,80,180,0.10)";
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

      drawGrid(t);

      for (let i = 0; i < candles.length; i++) {
        const cd = candles[i];
        const x = i * spacing - offset + spacing;
        const up = cd.c >= cd.o;
        const color = up ? "#12A767" : "#E23A63";
        const yo = priceToY(cd.o), yc = priceToY(cd.c);
        const yh = priceToY(cd.h), yl = priceToY(cd.l);

        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x, yh); ctx.lineTo(x, yl); ctx.stroke();

        const top = Math.min(yo, yc);
        const bh = Math.max(2, Math.abs(yc - yo));
        ctx.shadowColor = color;
        ctx.shadowBlur = up ? 6 : 4;
        ctx.fillStyle = color;
        ctx.globalAlpha = up ? 0.9 : 0.82;
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
