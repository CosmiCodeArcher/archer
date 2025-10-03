import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useState } from "react";

function Footer({ onSectionChange }) {
  const currentYear = new Date().getFullYear();
  const [hoveredLink, setHoveredLink] = useState(null);

  const navLinks = [
    { name: "portfolio", label: "Portfolio", icon: "💼", color: "from-blue-400 to-cyan-400" },
    { name: "about", label: "About", icon: "👨‍💻", color: "from-purple-400 to-pink-400" },
    { name: "contact", label: "Contact", icon: "📬", color: "from-orange-400 to-red-400" },
  ];

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/Ochiponu-Awodi",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.26.793-.577v-2.234c-3.338.724-4.043-1.607-4.043-1.607-.546-1.387-1.333-1.757-1.333-1.757-1.087-.744.083-.729.083-.729 1.205.085 1.838 1.238 1.838 1.238 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.932 0-1.31.467-2.381 1.235-3.221-.124-.304-.535-1.527.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02-.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.649.242 2.872.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.807 5.625-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      color: "hover:text-gray-800",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/awodi-ochiponu-b10126204",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764S5.534 3.204 6.5 3.204c.966 0 1.75.79 1.75 1.764S7.466 6.732 6.5 6.732zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" />
        </svg>
      ),
      color: "hover:text-blue-600",
    },
    {
      name: "Email",
      url: "mailto:awodiomale@gmail.com",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "hover:text-red-500",
    },
  ];

  const stats = [
    { value: "40+", label: "Projects Built", icon: "🚀" },
    { value: "3+", label: "Years Coding", icon: "⚡" },
    { value: "100%", label: "Passion", icon: "❤️" },
  ];

  return (
    <footer className="footer-container">
      <div className="footer-inner">
        {/* Wave Decoration */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ height: "60px", marginTop: "-60px" }}>
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-full"
            style={{ transform: "rotate(180deg)" }}
          >
            <motion.path
              d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z"
              fill="rgba(255, 255, 255, 0.1)"
              initial={{ d: "M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z" }}
              animate={{
                d: [
                  "M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z",
                  "M0,0 C300,80 900,120 1200,0 L1200,120 L0,120 Z",
                  "M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-modern-coral/50 transition-all duration-300"
            >
              <div className="text-2xl md:text-3xl mb-1">{stat.icon}</div>
              <div className="text-xl md:text-2xl font-bold text-modern-coral mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-700">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Footer Content */}
        <div className="footer-layout">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="footer-text-center space-y-3"
          >
            <motion.img
              src="/cca.jpg"
              alt="Awodi Logo"
              className="footer-logo"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            />
            <p className="footer-desc max-w-xs mx-auto md:mx-0">
              Creating responsive and user-friendly web experiences with passion and precision
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💚
              </motion.span>
              <span>Built with React & Tailwind</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h3 className="text-lg font-bold mb-4 text-gray-800">Quick Links</h3>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <motion.button
                  key={link.name}
                  type="button"
                  onClick={() => onSectionChange(link.name)}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="footer-button relative group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                  
                  {/* Animated underline */}
                  {hoveredLink === link.name && (
                    <motion.div
                      layoutId="footerUnderline"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${link.color}`}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Social & Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="footer-text-right space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800">Connect</h3>
              <div className="social-container">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target={social.name !== "Email" ? "_blank" : undefined}
                    rel={social.name !== "Email" ? "noopener noreferrer" : undefined}
                    className={`social-link text-gray-700 ${social.color} relative group`}
                    aria-label={social.name}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {social.icon}
                    
                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {social.name}
                    </span>
                    
                    {/* Ripple effect */}
                    <span className="absolute inset-0 rounded-full bg-modern-coral opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              Available for opportunities
            </motion.div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"
        />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600"
        >
          <p className="footer-copyright">
            © {currentYear} Awodi Ochiponu. Crafted with{" "}
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="inline-block text-red-500"
            >
              ❤️
            </motion.span>{" "}
            and lots of ☕
          </p>

          <div className="flex items-center gap-4">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-xs bg-white/20 px-3 py-1 rounded-full"
            >
              v2.0.0
            </motion.span>
            <motion.a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-modern-coral hover:text-modern-teal transition-colors duration-300 flex items-center gap-1"
              whileHover={{ y: -3 }}
            >
              <span>Back to top</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </motion.a>
          </div>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-modern-coral/30 rounded-full"
              style={{
                left: `${20 + i * 20}%`,
                bottom: "0%",
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  onSectionChange: PropTypes.func.isRequired,
};

export default Footer;