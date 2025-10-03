import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function Success() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="success-container">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(to right, ${
                i % 2 === 0 ? "#FF7F50" : "#00CED1"
              }, ${i % 2 === 0 ? "#00CED1" : "#FF7F50"})`,
              left: `${Math.random() * 100}%`,
              top: `-10%`,
            }}
            animate={{
              y: ["0vh", "110vh"],
              rotate: [0, 360],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: showConfetti ? Infinity : 0,
              delay: Math.random() * 0.5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="success-card relative z-10"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-24 h-24 mx-auto bg-gradient-to-r from-modern-coral to-modern-teal rounded-full flex items-center justify-center shadow-glow"
            >
              <span className="text-5xl">✓</span>
            </motion.div>
            
            {/* Pulsing Ring */}
            <motion.div
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 border-4 border-modern-coral rounded-full"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="success-heading text-3xl md:text-4xl mb-4"
        >
          Message Sent! 🎉
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="success-text text-base md:text-lg mb-8"
        >
          Thank you for reaching out! I will get back to you within 24 hours.
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs text-gray-600">Fast Reply</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">💯</div>
            <div className="text-xs text-gray-600">Guaranteed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🚀</div>
            <div className="text-xs text-gray-600">Excited</div>
          </div>
        </motion.div>

        {/* Return Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/">
            <motion.button
              className="success-button relative overflow-hidden group w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-modern-coral to-modern-teal" />
              <div className="absolute inset-0 bg-gradient-to-r from-modern-teal to-modern-coral opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative px-8 py-3 block text-white font-bold">
                ← Back to Home
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 text-4xl opacity-20 animate-bounce">
          🎊
        </div>
        <div className="absolute -bottom-4 -left-4 text-4xl opacity-20 animate-bounce" style={{ animationDelay: "0.5s" }}>
          ✨
        </div>
      </motion.div>

      {/* Floating Bubbles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`bubble-${i}`}
          className="absolute w-12 h-12 rounded-full opacity-10"
          style={{
            background: `linear-gradient(to right, ${
              i % 2 === 0 ? "#FF7F50" : "#00CED1"
            }, ${i % 2 === 0 ? "#00CED1" : "#FF7F50"})`,
            left: `${10 + i * 18}%`,
            bottom: "-10%",
          }}
          animate={{
            y: [0, -800],
            x: [0, (Math.random() - 0.5) * 100],
            scale: [1, 1.5, 0.5],
            opacity: [0.1, 0.3, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default Success;