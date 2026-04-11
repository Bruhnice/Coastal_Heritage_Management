import { motion } from "framer-motion";

export default function WaveTransition({ show }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #007bff, #00c6ff)",
        zIndex: 9999,
      }}
    >
      {/* Wave shape */}
      <svg
        viewBox="0 0 1440 320"
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
        }}
      >
        <path
          fill="#ffffff"
          fillOpacity="1"
          d="M0,224L60,208C120,192,240,160,360,144C480,128,600,128,720,144C840,160,960,192,1080,192C1200,192,1320,160,1380,144L1440,128V320H0Z"
        />
      </svg>
    </motion.div>
  );
}
