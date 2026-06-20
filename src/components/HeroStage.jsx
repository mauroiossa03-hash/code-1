import { Suspense, lazy, Component } from "react";

const Hero3D = lazy(() => import("./Hero3D.jsx"));

/* Pure-CSS fallback: a glowing glass orb. Used for reduced-motion,
   missing WebGL, or if the 3D chunk fails to load. */
function OrbFallback() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
      <div
        className="float"
        style={{
          width: "62%", maxWidth: 230, aspectRatio: "1",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), rgba(124,92,255,0.55) 42%, rgba(59,91,255,0.65) 72%, rgba(20,42,99,0.4))",
          boxShadow: "0 30px 70px rgba(59,91,255,0.45), inset 0 0 60px rgba(255,255,255,0.4)",
          filter: "saturate(120%)",
        }}
      />
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch { return false; }
}

export default function HeroStage() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !supportsWebGL()) return <OrbFallback />;

  return (
    <ErrorBoundary fallback={<OrbFallback />}>
      <Suspense fallback={<OrbFallback />}>
        <Hero3D />
      </Suspense>
    </ErrorBoundary>
  );
}
