import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGesture } from "@use-gesture/react";
import CountUp from "react-countup";
import { Tilt } from "react-tilt";
import PropTypes from "prop-types";

function Portfolio() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState("All");
  const [isMuted, setIsMuted] = useState(false);
  const [carouselX, setCarouselX] = useState(0);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [hoveredFilter, setHoveredFilter] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState("carousel"); // carousel or grid
  const carouselRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto switch to grid on mobile
      if (window.innerWidth < 768) {
        setViewMode("grid");
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const projects = [
    {
      title: "TeeDo",
      description: "Full-Stack Todo App, built solo with AI assist, March 2025",
      technologies: ["React", "Vite", "Python"],
      category: "Web2",
      image: "/TeeDo.png",
      live: "https://teedo-frontend.vercel.app",
      stats: { commits: 120, hours: 40 },
      qr: "/teedo-qr.png",
      highlight: "Full-Stack",
    },
    {
      title: "Awodi Quizzical",
      description: "An interactive quiz app built with React.",
      technologies: ["React"],
      category: "Web2",
      image: "/awodi-quizzical.png",
      live: "https://awodi-quizzical.netlify.app",
      stats: { commits: 80, hours: 25 },
      qr: "/quizzical-qr.png",
      highlight: "Interactive",
    },
    {
      title: "Tenzies Game",
      description: "Digital dice game Tenzies.",
      technologies: ["React"],
      category: "Web2",
      image: "/scrimba-tenzies.png",
      live: "https://scrimba-tenzies-awodi.netlify.app",
      stats: { commits: 60, hours: 20 },
      qr: "/tenzies-qr.png",
      highlight: "Game",
    },
    {
      title: "Meme Generator",
      description: "Create custom memes with random images.",
      technologies: ["React"],
      category: "Web2",
      image: "/meme-gen.png",
      live: "https://scrimba-meme-generator-awodi.netlify.app/",
      stats: { commits: 50, hours: 15 },
      qr: "/meme-qr.png",
      highlight: "Creative",
    },
  ];

  const filters = [
    { name: "All", icon: "🌐", color: "from-purple-400 to-pink-400", description: "View everything" },
    { name: "Web2", icon: "💻", color: "from-blue-400 to-cyan-400", description: "Traditional web apps" },
    { name: "Web3", icon: "⛓️", color: "from-orange-400 to-red-400", description: "Blockchain & DeFi" },
  ];

  const filteredProjects = filter === "All" 
    ? projects 
    : projects.filter((p) => p.category === filter);

  const cardWidth = isMobile ? 280 : 320;

  useGesture(
    {
      onDrag: ({ movement: [mx], event }) => {
        event.preventDefault();
        if (viewMode === "carousel") {
          setCarouselX((prevX) => {
            const newX = prevX + mx * 9;
            const maxScroll = filteredProjects.length * cardWidth;
            return newX < -maxScroll ? -maxScroll : newX > 0 ? 0 : newX;
          });
        }
      },
    },
    { target: carouselRef, drag: { axis: "x", filterTaps: true } }
  );

  const playSound = (type) => {
    if (!isMuted) {
      const audio = new Audio(type === "hover" ? "/hover-whoosh.mp3" : "/click-pop.mp3");
      audio.play().catch(() => {});
    }
  };

  const BubbleBurst = ({ trigger }) => (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(isMobile ? 4 : 8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-modern-coral to-modern-teal rounded-full"
              style={{
                left: "50%",
                top: "50%"
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: (Math.cos((i / (isMobile ? 4 : 8)) * Math.PI * 2) * (isMobile ? 60 : 100)),
                y: (Math.sin((i / (isMobile ? 4 : 8)) * Math.PI * 2) * (isMobile ? 60 : 100)),
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  BubbleBurst.propTypes = {
    trigger: PropTypes.bool.isRequired,
  };

  const ProjectCard = ({ project, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={viewMode === "grid" ? "w-full" : "flex-shrink-0"}
      style={viewMode === "carousel" ? { width: cardWidth } : {}}
    >
      <Tilt options={{ max: isMobile ? 10 : 15, scale: isMobile ? 1.02 : 1.03 }}>
        <motion.div
          className="portfolio-card bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md rounded-[20px] p-4 md:p-5 shadow-lg hover:shadow-glow transition-all duration-300 cursor-pointer relative overflow-hidden h-full border border-white/30"
          whileHover={{ y: -5 }}
          onClick={() => {
            setSelectedProject(project);
            playSound("click");
          }}
          onHoverStart={() => {
            if (!isMobile) {
              setHoveredProject(project.title);
              playSound("hover");
            }
          }}
          onHoverEnd={() => !isMobile && setHoveredProject(null)}
          onTouchStart={() => setHoveredProject(project.title)}
          onTouchEnd={() => setHoveredProject(null)}
        >
          {/* Highlight Badge */}
          <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10">
            <span className="px-2 py-1 md:px-3 md:py-1 bg-gradient-to-r from-modern-coral to-modern-teal text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">
              {project.highlight}
            </span>
          </div>

          {/* Image */}
          <div className="relative overflow-hidden rounded-xl mb-3 md:mb-4 group">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-40 md:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <h3 className="text-base md:text-xl font-bold text-modern-coral mb-2">
            {project.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-700 mb-3 line-clamp-2">
            {project.description}
          </p>

          {/* Tech Tags */}
          <div className="tech-tags flex flex-wrap gap-1.5 md:gap-2 mb-3">
            {project.technologies.map((tag) => (
              <span
                key={tag}
                className="text-[9px] md:text-xs bg-modern-teal/20 text-modern-teal px-2 py-0.5 md:py-1 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="stats flex justify-between text-[10px] md:text-sm text-gray-600 pt-3 border-t border-gray-200">
            <span className="flex items-center gap-1">
              📝 <CountUp end={project.stats.commits} duration={2} />+ commits
            </span>
            <span className="flex items-center gap-1">
              ⏱️ <CountUp end={project.stats.hours} duration={2} />+ hrs
            </span>
          </div>

          {/* Bubble Burst Effect */}
          <BubbleBurst trigger={hoveredProject === project.title} />
        </motion.div>
      </Tilt>
    </motion.div>
  );

  ProjectCard.propTypes = {
    project: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
  };

  return (
    <div className="portfolio-container p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4"
      >
        <h2 className="cool-text text-2xl md:text-5xl font-bold text-center md:text-left" data-text="My Projects">
          My Projects
        </h2>
        <div className="flex gap-2">
          {!isMobile && (
            <>
              <motion.button
                onClick={() => setViewMode("carousel")}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                  viewMode === "carousel"
                    ? "bg-modern-coral text-white"
                    : "bg-white/50 text-gray-700 hover:bg-white/80"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎠 Carousel
              </motion.button>
              <motion.button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-modern-coral text-white"
                    : "bg-white/50 text-gray-700 hover:bg-white/80"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📱 Grid
              </motion.button>
            </>
          )}
          <motion.button
            onClick={() => setIsMuted((m) => !m)}
            className="px-3 py-1.5 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 text-xs md:text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? "🔇" : "🔊"}
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Filters */}
      <div className="filter-bar flex flex-wrap gap-2 md:gap-4 mb-8 md:mb-10 justify-center">
        {filters.map((filterItem, index) => (
          <motion.div
            key={filterItem.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
            onMouseEnter={() => !isMobile && setHoveredFilter(filterItem.name)}
            onMouseLeave={() => !isMobile && setHoveredFilter(null)}
          >
            <Tilt options={{ max: isMobile ? 5 : 15, scale: 1.05 }}>
              <motion.button
                onClick={() => {
                  setFilter(filterItem.name);
                  playSound("click");
                  setCarouselX(0);
                }}
                className="relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`bg-gradient-to-r ${filterItem.color} p-0.5 rounded-xl md:rounded-2xl`}>
                  <div className={`px-3 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                    filter === filterItem.name
                      ? "bg-white/90 shadow-glow"
                      : "bg-white/70 hover:bg-white/90"
                  }`}>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className="text-lg md:text-2xl">{filterItem.icon}</span>
                      <span className={`font-bold text-xs md:text-base ${
                        filter === filterItem.name ? "text-transparent bg-gradient-to-r bg-clip-text " + filterItem.color : ""
                      }`}>
                        {filterItem.name}
                      </span>
                      {filter === filterItem.name && filterItem.name !== "All" && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 bg-modern-coral text-white text-[10px] md:text-xs rounded-full"
                        >
                          {filteredProjects.length}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tooltip - Desktop only */}
                {!isMobile && (
                  <AnimatePresence>
                    {hoveredFilter === filterItem.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-20 top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap"
                      >
                        {filterItem.description}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.button>
            </Tilt>
          </motion.div>
        ))}
      </div>

      {/* Empty State for Web3 */}
      {filter === "Web3" && filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 md:py-20"
        >
          <div className="text-5xl md:text-6xl mb-4">🚀</div>
          <h3 className="text-xl md:text-2xl font-bold mb-2 text-modern-coral">Coming Soon!</h3>
          <p className="text-sm md:text-base text-gray-600">Web3 projects are in development. Stay tuned!</p>
        </motion.div>
      )}

      {/* Projects Display */}
      {filteredProjects.length > 0 && (
        <>
          {viewMode === "carousel" ? (
            // Carousel View
            <div ref={carouselRef} className="portfolio-carousel overflow-hidden relative mb-8">
              <motion.div
                className="flex gap-4 md:gap-6 py-4"
                animate={{ x: carouselX }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.title} project={project} index={index} />
                ))}
              </motion.div>

              {/* Navigation Arrows */}
              {filteredProjects.length > 1 && (
                <>
                  <motion.button
                    onClick={() => setCarouselX((x) => Math.min(x + cardWidth, 0))}
                    className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-modern-coral p-2 md:p-3 rounded-full hover:bg-modern-coral hover:text-white transition-all duration-300 shadow-lg z-10"
                    whileHover={{ scale: 1.1, x: -5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={() => setCarouselX((x) => Math.max(x - cardWidth, -(filteredProjects.length * cardWidth)))}
                    className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-modern-coral p-2 md:p-3 rounded-full hover:bg-modern-coral hover:text-white transition-all duration-300 shadow-lg z-10"
                    whileHover={{ scale: 1.1, x: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </>
              )}
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.title} project={project} index={index} />
              ))}
            </div>
          )}

          {/* Swipe Indicator for Mobile Carousel */}
          {isMobile && viewMode === "carousel" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-xs text-gray-500 mb-4 flex items-center justify-center gap-2"
            >
              <span>👆</span>
              <span>Swipe to explore</span>
              <span>👆</span>
            </motion.div>
          )}
        </>
      )}

      {/* Project Modal - Mobile Optimized */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content */}
            <motion.div
              className="relative bg-gradient-to-br from-white/95 to-white/90 p-4 md:p-8 rounded-2xl md:rounded-3xl max-w-2xl w-full backdrop-blur-md shadow-2xl border border-white/30 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, rotateX: 90 }}
              animate={{ scale: 1, rotateX: 0 }}
              exit={{ scale: 0.8, rotateX: -90 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={() => setSelectedProject(null)}
                className="absolute top-2 right-2 md:top-4 md:right-4 bg-modern-coral text-white p-2 rounded-full hover:bg-modern-teal transition-colors duration-300 z-10"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Orbiting Decorations - Desktop only */}
              {!isMobile && [...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 bg-gradient-to-r from-modern-coral to-modern-teal rounded-full opacity-30"
                  style={{ top: "20%", left: "10%" }}
                  animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    rotate: 360,
                  }}
                  transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}

              <h3 className="cool-text text-xl md:text-4xl font-bold mb-4 md:mb-6 pr-8 md:pr-10" data-text={selectedProject.title}>
                {selectedProject.title}
              </h3>

              {/* Image */}
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-lg">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-40 md:h-64 object-cover"
                />
                <div className="absolute top-2 left-2 md:top-4 md:left-4">
                  <span className="px-3 py-1 md:px-4 md:py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs md:text-sm font-bold text-modern-coral">
                    {selectedProject.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs md:text-base text-gray-700 mb-4 md:mb-6">{selectedProject.description}</p>

              {/* Tech Stack */}
              <div className="mb-4 md:mb-6">
                <h4 className="font-bold mb-2 md:mb-3 text-base md:text-lg">Tech Stack</h4>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {selectedProject.technologies.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-modern-teal/20 to-modern-coral/20 text-gray-800 rounded-full text-xs md:text-sm font-medium border border-modern-teal/30"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-gradient-to-br from-modern-coral/10 to-modern-coral/5 p-3 md:p-4 rounded-xl text-center">
                  <div className="text-2xl md:text-3xl font-bold text-modern-coral">
                    <CountUp end={selectedProject.stats.commits} duration={2} />+
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Commits</div>
                </div>
                <div className="bg-gradient-to-br from-modern-teal/10 to-modern-teal/5 p-3 md:p-4 rounded-xl text-center">
                  <div className="text-2xl md:text-3xl font-bold text-modern-teal">
                    <CountUp end={selectedProject.stats.hours} duration={2} />+
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Hours</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                {selectedProject.live && (
                  <motion.a
                    href={selectedProject.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-modern-coral to-modern-teal text-white rounded-xl font-bold text-center hover:shadow-glow transition-all duration-300 text-sm md:text-base"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🚀 View Live
                  </motion.a>
                )}
                <motion.a
                  href={selectedProject.qr || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 md:px-6 md:py-3 bg-white/70 backdrop-blur-sm text-gray-800 rounded-xl font-medium hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>📱 View in AR</span>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Portfolio;