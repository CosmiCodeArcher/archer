import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {Tilt} from "react-tilt";
import Portfolio from "./Portfolio";
import About from "./About";
import Contact from "./Contact";
import { saveState, loadState } from "./localStorage";
import PropTypes from "prop-types";

function Hero({ currentSection, setCurrentSection }) {
  const [hoveredSection, setHoveredSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedState = loadState();
    if (savedState?.currentSection) setCurrentSection(savedState.currentSection);
  }, [setCurrentSection]);

  useEffect(() => {
    if (currentSection) {
      saveState({ currentSection });
      const sectionElement = document.getElementById(currentSection);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [currentSection]);

  const handleInteraction = (section, isClick = false) => {
    if (isClick) {
      setCurrentSection(section);
      setHoveredSection(null);
    } else {
      setHoveredSection(section);
    }
  };

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const sections = [
    { id: "portfolio", component: <Portfolio />, label: "Portfolio", preview: "See my projects" },
    { id: "about", component: <About />, label: "About", preview: "Learn about me" },
    { id: "contact", component: <Contact />, label: "Contact", preview: "Get in touch" },
  ];

  const buttonVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, type: "spring", stiffness: 120, damping: 10 },
    }),
    hover: { scale: 1.1, rotate: 5, boxShadow: "0 0 15px rgba(217, 95, 58, 0.8)" },
  };

  const ParticleTrail = ({ active }) =>
    active &&
    Array.from({ length: 5 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-modern-teal rounded-full"
        initial={{ opacity: 1, scale: 1 }}
        animate={{
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 50,
          opacity: 0,
          scale: 0,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    ));

  return (
    <div className="hero-container p-2 sm:p-4 md:p-8">
      <img
        src="/Awodi.png"
        alt="Awodi brand text"
        className="hero-logo w-[30%] sm:w-[25%] md:w-[20%] lg:w-[15%]"
        onClick={toggleModal}
      />
      {!currentSection && (
        <div className="hero-welcome">
          <span
            className="cool-text text-modern-coral text-glow font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl"
            data-text="Discover Awodi"
          >
            Discover Awodi
          </span>
        </div>
      )}
      {isModalOpen && (
        <div className="modal-overlay p-2 sm:p-4">
          <div className="modal-content max-w-sm md:max-w-md animate-[slideIn_0.3s_ease-out]">
          <button
              type="button"
              className="absolute top-2 right-2 text-modern-coral hover:text-modern-teal text-xl md:text-2xl"
              onClick={toggleModal}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className="modal-heading text-xl md:text-2xl">Welcome to Awodi!</h2>
            <p className="modal-text text-xs md:text-sm">
              Hey there! I’m Awodi, a web developer crafting responsive and creative experiences. Explore my work, learn about me, or drop a message—I’m excited you’re here!
            </p>
            <button
              type="button"
              className="modal-button px-3 py-1 md:px-4 md:py-2 text-sm md:text-base"
              onClick={toggleModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="nav-container mt-4 sm:mt-6 md:mt-8">
        <nav className="hero-nav flex flex-row gap-2 sm:gap-4 md:gap-6 relative overflow-hidden bg-gradient-to-r from-modern-coral/20 to-modern-teal/20 py-2 rounded-lg">
          {sections.map(({ id, label, preview }, index) => (
            <Tilt key={id} options={{ max: 25, scale: 1.05, speed: 300 }}>
              <motion.div
                custom={index}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="relative"
                onMouseEnter={() => handleInteraction(id)}
                onClick={() => handleInteraction(id, true)}
              >
              <button
                type="button"
                className={`nav-button ${currentSection === id ? "text-modern-coral" : "text-white"} text-sm sm:text-base md:text-lg py-2 sm:py-3 hover:text-modern-teal transition-all duration-300 relative z-10`}
                aria-label={`Go to ${label}`}
              >
                {label}
                {hoveredSection === id && (
                    <motion.span
                      className="absolute inset-0 bg-modern-coral/30 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
              </button>
              <ParticleTrail active={hoveredSection === id} />
              {hoveredSection === id && (
                <div className="nav-tooltip text-xs md:text-sm">{preview}</div>
              )}
            </motion.div>
          </Tilt>
          ))}
        </nav>
        <div className="sections-container space-y-2 md:space-y-8">
          {sections.map(({ id, component }) => (
            <section
              key={id}
              id={id}
              className={`section ${currentSection === id ? "block opacity-100" : "hidden opacity-0"} transition-opacity duration-500`}
            >
              {component}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

Hero.propTypes = {
  currentSection: PropTypes.string,
  setCurrentSection: PropTypes.func.isRequired,
};

export default Hero;