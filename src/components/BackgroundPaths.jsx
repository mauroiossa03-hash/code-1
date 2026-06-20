import { useMemo } from "react";
import { motion } from "framer-motion";

/* One sweeping family of flowing lines, mirrored left/right via `position`. */
function FloatingPaths({ position }) {
  const paths = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${
          312 - i * 5 * position
        } ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
          684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.6 + i * 0.045,
      })),
    [position]
  );

  return (
    <svg
      viewBox="0 0 696 316"
      fill="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke="#3B5BFF"
          strokeWidth={path.width}
          strokeOpacity={0.16 + path.id * 0.018}
          initial={{ pathLength: 0.3, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: [0.35, 0.65, 0.35], pathOffset: [0, 1, 0] }}
          transition={{ duration: 20 + (path.id % 10), repeat: Infinity, ease: "linear" }}
        />
      ))}
    </svg>
  );
}

/* Animated flowing-lines backdrop, used behind page content (light theme). */
export default function BackgroundPaths() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </div>
  );
}
