import { useState } from "react";
import { motion } from "framer-motion";
import { Tilt } from "react-tilt";

function About() {
  const [activeSkill, setActiveSkill] = useState(null);

  const skills = [
    { 
      name: "React", 
      level: 90, 
      icon: "⚛️",
      description: "Building dynamic UIs with hooks and modern patterns",
      color: "from-blue-400 to-cyan-400"
    },
    { 
      name: "Vite", 
      level: 85, 
      icon: "⚡",
      description: "Lightning-fast development with modern build tools",
      color: "from-purple-400 to-pink-400"
    },
    { 
      name: "Tailwind", 
      level: 88, 
      icon: "🎨",
      description: "Crafting beautiful, responsive designs efficiently",
      color: "from-teal-400 to-green-400"
    },
    { 
      name: "Python", 
      level: 82, 
      icon: "🐍",
      description: "Backend development and automation scripts",
      color: "from-yellow-400 to-orange-400"
    },
    { 
      name: "WebSockets", 
      level: 75, 
      icon: "🔌",
      description: "Real-time bidirectional communication",
      color: "from-red-400 to-pink-400"
    },
  ];

  const journey = [
    { 
      year: "The Beginning", 
      title: "First Lines of Code", 
      description: "Felt both intimidated and inspired seeing code for the first time",
      icon: "🌱"
    },
    { 
      year: "Growth", 
      title: "Intensive Learning", 
      description: "Completed online courses and dove deep into web development",
      icon: "📚"
    },
    { 
      year: "Building", 
      title: "40+ Projects", 
      description: "Each project taught valuable lessons about code and UX",
      icon: "🚀"
    },
    { 
      year: "Present", 
      title: "React Specialist", 
      description: "Focused on creating responsive, user-friendly applications",
      icon: "⚡"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="cool-text text-3xl md:text-5xl font-bold mb-4" data-text="About Me">
          About Me
        </h2>
                  <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto"
        >
          A passionate web developer crafting experiences that blend creativity with functionality
        </motion.p>
      </motion.div>

      {/* Introduction Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6 mb-12"
      >
        <motion.div variants={itemVariants}>
          <Tilt options={{ max: 15, scale: 1.02 }}>
            <div className="bg-gradient-to-br from-modern-coral/10 to-modern-teal/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">👨‍💻</div>
              <h3 className="text-xl font-bold mb-3 text-modern-coral">The Journey</h3>
              <p className="text-sm md:text-base text-gray-700">
                My journey began from the intimidation and ambition I felt when I saw lines of code 
                for the first time. Since then, I've immersed myself in the world of coding, building 
                over 40 web applications that taught me invaluable lessons.
              </p>
            </div>
          </Tilt>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tilt options={{ max: 15, scale: 1.02 }}>
            <div className="bg-gradient-to-br from-modern-teal/10 to-vintage-sage/20 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:shadow-glow transition-all duration-300">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-modern-teal">The Vision</h3>
              <p className="text-sm md:text-base text-gray-700">
                Looking ahead, I'm excited to dive further into React technologies like Next.js. 
                I'm always open to new challenges and opportunities to grow as a developer, 
                constantly pushing boundaries.
              </p>
            </div>
          </Tilt>
        </motion.div>
      </motion.div>

      {/* Skills Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-modern-coral to-modern-teal bg-clip-text text-transparent">
            Technical Arsenal
          </span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setActiveSkill(skill.name)}
              onHoverEnd={() => setActiveSkill(null)}
            >
              <Tilt options={{ max: 20, scale: 1.05 }}>
                <div className="relative group">
                  <div className={`bg-gradient-to-br ${skill.color} p-0.5 rounded-xl`}>
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl h-full">
                      <div className="text-3xl md:text-4xl mb-2 text-center">{skill.icon}</div>
                      <h4 className="font-bold text-center mb-2 text-sm md:text-base">{skill.name}</h4>
                      
                      {/* Skill Level Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <p className="text-xs text-center text-gray-600">{skill.level}%</p>
                      
                      {/* Tooltip */}
                      {activeSkill === skill.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs p-2 rounded-lg"
                        >
                          {skill.description}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Particle effect on hover */}
                  {activeSkill === skill.name && (
                    <motion.div className="absolute inset-0 pointer-events-none">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-2 h-2 bg-gradient-to-r ${skill.color} rounded-full`}
                          initial={{ x: "50%", y: "50%", opacity: 1 }}
                          animate={{
                            x: `${50 + (Math.random() - 0.5) * 100}%`,
                            y: `${50 + (Math.random() - 0.5) * 100}%`,
                            opacity: 0
                          }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Journey Timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-modern-teal to-modern-coral bg-clip-text text-transparent">
            My Journey
          </span>
        </h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-modern-coral via-modern-teal to-vintage-sage transform md:-translate-x-1/2" />
          
          {journey.map((stage, index) => (
            <motion.div
              key={stage.year}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative mb-8 md:mb-12 ${
                index % 2 === 0 ? "md:pr-1/2 md:text-right" : "md:pl-1/2 md:ml-auto md:text-left"
              }`}
            >
              <div className="ml-16 md:ml-0">
                <Tilt options={{ max: 10, scale: 1.02 }}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg hover:shadow-glow transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{stage.icon}</span>
                      <div>
                        <div className="text-xs md:text-sm font-semibold text-modern-coral uppercase tracking-wider">
                          {stage.year}
                        </div>
                        <h4 className="text-lg md:text-xl font-bold">{stage.title}</h4>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-700">{stage.description}</p>
                  </motion.div>
                </Tilt>
              </div>
              
              {/* Timeline dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="absolute left-8 md:left-1/2 top-8 w-4 h-4 bg-gradient-to-br from-modern-coral to-modern-teal rounded-full transform -translate-x-1/2 border-4 border-white shadow-lg"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Beyond Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Tilt options={{ max: 5, scale: 1.01 }}>
          <div className="bg-gradient-to-br from-vintage-sage/30 to-modern-teal/20 backdrop-blur-md p-8 rounded-2xl border border-white/20">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center">
              <span className="bg-gradient-to-r from-modern-coral to-vintage-sage bg-clip-text text-transparent">
                Beyond the Code
              </span>
            </h3>
            <p className="text-center text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
              When I'm not coding, you can find me immersing myself in various arts. I find that 
              these activities complement my development work by enhancing my mindset and creativity, 
              bringing fresh perspectives to problem-solving.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              {["🎨", "🎵", "📚", "🎮"].map((icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="text-3xl md:text-4xl cursor-pointer"
                >
                  {icon}
                </motion.div>
              ))}
            </div>
          </div>
        </Tilt>
      </motion.div>
    </div>
  );
}

export default About;