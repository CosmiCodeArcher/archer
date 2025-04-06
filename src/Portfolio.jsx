import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGesture } from "@use-gesture/react";
import CountUp from "react-countup";
import PropTypes from "prop-types";

function Portfolio() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState("All");
  const [isMuted, setIsMuted] = useState(false);
  const [carouselX, setCarouselX] = useState(0);
  const [hoveredProject, setHoveredProject] = useState(null);
  const carouselRef = useRef(null);

  const projects = [
    {
      title: "TeeDo",
      description: "Full-Stack Todo App, built solo with AI assist, March 2025",
      technologies: ["React", "Vite", "Python",],
      image: "/TeeDo.png",
      live: "https://teedo-frontend.vercel.app",
      stats: { commits: 120, hours: 40 },
      qr: "/teedo-qr.png", // Placeholder for AR QR
    },
    {
      title: "Awodi Quizzical",
      description: "An interactive quiz app built with React.",
      technologies: ["React",],
      image: "/awodi-quizzical.png",
      live: "https://awodi-quizzical.netlify.app",
      stats: { commits: 80, hours: 25 },
      qr: "/quizzical-qr.png",
    },
    {
      title: "Tenzies Game",
      description: "Digital dice game Tenzies.",
      technologies: ["React",],
      image: "/scrimba-tenzies.png",
      live: "https://scrimba-tenzies-awodi.netlify.app",
      stats: { commits: 60, hours: 20 },
      qr: "/tenzies-qr.png",
    },
    {
      title: "Meme Generator",
      description: "Create custom memes with random images.",
      technologies: ["React",],
      image: "/meme-gen.png",
      live: "https://scrimba-meme-generator-awodi.netlify.app/",
      stats: { commits: 50, hours: 15 },
      qr: "/meme-qr.png",
    },
  ];

  const allTech = ["All", ...new Set(projects.flatMap((p) => p.technologies))];
  const filteredProjects = filter === "All" ? projects : projects.filter((p) => p.technologies.includes(filter));

  const cardWidth = window.innerWidth < 768 ? 160 : 280;

  useGesture(
    {
      onDrag: ({ movement: [mx], event }) => {
        event.preventDefault();
        setCarouselX((prevX) => {
          const newX = prevX + mx * 9;
          const maxScroll = filteredProjects.length * cardWidth;
          return newX < -maxScroll ? -maxScroll : newX > 0 ? 0 : newX; // Bound and loop
        });
      },
    },
    { target: carouselRef, drag: { axis: "x", filterTaps: true } }
  );

  // Sound Effects
  const playSound = (type) => {
    if (!isMuted) {
      const audio = new Audio(type === "hover" ? "/hover-whoosh.mp3" : "/click-pop.mp3");
      audio.play();
    }
  };

  // Bubble Burst Component
  const BubbleBurst = ({ trigger }) => (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={trigger ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 md:w-3 md:h-3 bg-[#77fd89] rounded-full"
          initial={{ x: "50%", y: "50%" }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 100}%`,
            y: `${50 + (Math.random() - 0.5) * 100}%`,
            scale: 0,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );

  BubbleBurst.propTypes = {
    trigger: PropTypes.bool.isRequired,
  };


  return (
    <div className="portfolio-container p-4 md:p-8 max-w-7xl mx-auto backdrop-blur-sm">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="cool-text text-2xl md:text-4xl font-bold mb-4 md:mb-0" data-text="My Projects">
          My Projects
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="text-sm text-modern-coral hover:text-modern-teal transition-colors duration-300"
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar flex flex-wrap gap-2 md:gap-3 mb-8 justify-center">
        {allTech.map((tech) => (
          <motion.button
            key={tech}
            onClick={() => {
              setFilter(tech);
              playSound("click");
            }}
            className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                filter === tech
                  ? "bg-modern-coral text-white shadow-glow"
                  : "bg-white/10 text-blue-900 hover:text-modern-coral"
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tech}
          </motion.button>
        ))}
      </div>

      {/* Carousel */}
      <div 
        ref={carouselRef} className="portfolio-carousel overflow-hidden relative"
      >
        <motion.div
          className="flex"
          animate={{ x: carouselX }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.title}
              className="portfolio-card hover:gradient-border bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md rounded-[20px] p-4 mx-2 shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden"
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ perspective: 1000}}
              onClick={() => {
                setSelectedProject(project);
                playSound("click");
            }}
            onHoverStart={() => {
                setHoveredProject(project.title);
                playSound("hover");
            }}
            onHoverEnd={() => setHoveredProject(null)}
            >
              <BubbleBurst trigger={hoveredProject === project.title} />
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-24 md:h-40 object-cover rounded-md mb-4"
              />
              <h3 className="text-sm md:text-lg font-semibold text-modern-coral">{project.title}</h3>
              <p className="text-xs md:text-sm text-gray-200 mb-2">{project.description}</p>
              <div className="tech-tags flex flex-wrap gap-2">
                {project.technologies.map((tag) => (
                  <span key={tag} className="text-[10px] md:text-xs bg-modern-teal/20 text-modern-teal px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="stats mt-2 text-[10px] md:text-sm text-gray-300">
                <span>
                  <CountUp end={project.stats.commits} duration={2} />+ Commits
                </span>
                <span className="ml-2">
                  <CountUp end={project.stats.hours} duration={2} />+ Hours
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <button
          onClick={() => setCarouselX((x) => Math.min(x + cardWidth, 0))}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-modern-coral/80 text-white p-2 rounded-full hover:bg-modern-teal transition-colors duration-300"
        >
          👈
        </button>
        <button
          onClick={() => setCarouselX((x) => Math.max(x - cardWidth, -(filteredProjects.length * cardWidth)))}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-modern-coral/80 text-white p-2 rounded-full hover:bg-modern-teal transition-colors duration-300"
        >
          👉
        </button>
      </div>

      {/* Spotlight Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="bg-white/90 p-4 md:p-6 rounded-lg max-w-md md:max-w-lg w-full backdrop-blur-sm relative"
              initial={{ scale: 0, rotateX: 90 }}
              animate={{ scale: 1, rotateX: 0 }}
              exit={{ scale: 0, rotateX: 90 }}
              style={{ perspective: 1000 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Orbiting Bubbles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 bg-modern-teal/50 rounded-full"
                  style={{ top: "10%", left: "10%" }}
                  animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    rotate: 360,
                  }}
                  transition={{ duration: 5, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
              <h3 className="cool-text text-2xl font-bold mb-4" data-text={selectedProject.title}>
                {selectedProject.title}
              </h3>
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-40 md:h-48 object-cover rounded-md mb-4"
              />
              <p className="text-xs md:text-sm mb-4">{selectedProject.description}</p>
              <div className="tech-tags flex flex-wrap gap-2 mb-4">
                {selectedProject.technologies.map((tag) => (
                  <span key={tag} className="text-[10px] md:text-xs bg-modern-teal/20 text-modern-teal px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="stats mb-4 text-xs md:text-sm text-gray-400">
                <span>{selectedProject.stats.commits}+ Commits</span>
                <span className="ml-2">{selectedProject.stats.hours}+ Hours</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {selectedProject.live && (
                  <a
                    href={selectedProject.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-modern-coral text-white rounded-md hover:bg-modern-teal transition-colors duration-300 text-sm"
                  >
                    Live Link
                  </a>
                )}
                <a
                  href={selectedProject.qr || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-md hover:bg-gray-500/40 transition-colors duration-300 flex items-center gap-2 text-sm"
                >
                  <span>View in AR</span>
                  {/* Replace with real QR later */}
                  <img src="/qr-placeholder.png" alt="AR QR" className="w-6 h-6" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Portfolio;