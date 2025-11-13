import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

function FloatingActionButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to="/meeting">
      <motion.div
        className="fixed bottom-6 right-6 z-50 group"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pulsing rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-modern-coral to-modern-teal"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-modern-coral to-modern-teal"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />

        {/* Main button */}
        <motion.div
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-modern-coral to-modern-teal shadow-glow flex items-center justify-center cursor-pointer"
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Calendar icon */}
          <motion.span
            className="text-2xl md:text-3xl"
            animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="https://awodi.netlify.app/weekend.png" 
              alt="Calendar Icon" 
              className="w-6 h-6 md:w-8 md:h-8 object-contain" 
              style={{ display: 'inline-block' }}
            />
          </motion.span>

          {/* Sparkles on hover */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i / 4) * Math.PI * 2) * 30,
                      y: Math.sin((i / 4) * Math.PI * 2) * 30,
                    }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg"
            >
              Schedule a Meeting
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-900 dark:border-l-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

export default FloatingActionButton;