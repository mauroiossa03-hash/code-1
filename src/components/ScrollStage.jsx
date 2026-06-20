import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

/* Scroll-driven 3D tilt-in card, adapted from Aceternity's ContainerScroll. */
export default function ScrollStage({ children, background }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "start 0.3"] });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.88, 1] : [0.92, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.4, 1]);

  return (
    <div ref={containerRef} style={{ width: "100%", perspective: 1000 }}>
      <motion.div
        style={{
          rotateX: rotate,
          scale,
          opacity,
          borderRadius: 24,
          background,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
