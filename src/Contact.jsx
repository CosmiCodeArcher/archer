import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tilt } from "react-tilt";

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const socialLinks = [
    {
      name: "Email",
      icon: "✉️",
      value: "awodiomale@gmail.com",
      link: "mailto:awodiomale@gmail.com",
      color: "from-red-400 to-pink-400",
      description: "Drop me an email"
    },
    {
      name: "LinkedIn",
      icon: "💼",
      value: "linkedin.com/in/awodi-ochiponu",
      link: "https://www.linkedin.com/in/awodi-ochiponu-b10126204",
      color: "from-blue-400 to-cyan-400",
      description: "Let's connect professionally"
    },
    {
      name: "GitHub",
      icon: "🐙",
      value: "github.com/Ochiponu-Awodi",
      link: "https://github.com/Ochiponu-Awodi",
      color: "from-gray-600 to-gray-800",
      description: "Check out my code"
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowParticles(true);
    
    const form = e.target;
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    })
      .then(() => {
        setTimeout(() => {
          window.location.href = "/success";
        }, 1000);
      })
      .catch((error) => {
        alert(error);
        setIsSubmitting(false);
        setShowParticles(false);
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="cool-text text-3xl md:text-5xl font-bold mb-4" data-text="Let's Connect">
          Let's Connect
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto"
        >
          I'm always open to new opportunities and collaborations. Feel free to reach out!
        </motion.p>
      </motion.div>

      {/* Social Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-3 gap-6 mb-12"
      >
        {socialLinks.map((social, index) => (
          <motion.div
            key={social.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -5 }}
          >
            <Tilt options={{ max: 15, scale: 1.03 }}>
              <a
                href={social.link}
                target={social.name !== "Email" ? "_blank" : undefined}
                rel={social.name !== "Email" ? "noopener noreferrer" : undefined}
                className="block"
              >
                <div className={`bg-gradient-to-br ${social.color} p-0.5 rounded-2xl h-full`}>
                  <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl h-full hover:bg-white/80 transition-all duration-300 group relative overflow-hidden">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{social.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{social.description}</p>
                    <p className="text-xs text-gray-500 break-all">{social.value}</p>
                    
                    {/* Hover effect particles */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-2 h-2 bg-gradient-to-r ${social.color} rounded-full`}
                          initial={{ x: "50%", y: "50%", opacity: 0 }}
                          animate={{
                            x: `${Math.random() * 100}%`,
                            y: `${Math.random() * 100}%`,
                            opacity: [0, 1, 0]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </div>
              </a>
            </Tilt>
          </motion.div>
        ))}
      </motion.div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tilt options={{ max: 5, scale: 1.01 }}>
          <div className="bg-gradient-to-br from-modern-coral/10 to-modern-teal/10 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/30 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-modern-coral/20 to-transparent rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-modern-teal/20 to-transparent rounded-full blur-3xl -z-10" />
            
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-modern-coral to-modern-teal bg-clip-text text-transparent">
                Send me a message
              </span>
            </h3>

            <form
              name="contact"
              method="POST"
              data-netlify="true"
              onSubmit={handleSubmit}
              className="space-y-6 relative"
            >
              <input type="hidden" name="form-name" value="contact" />

              {/* Name Field */}
              <div className="relative">
                <motion.input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-transparent rounded-xl focus:outline-none focus:border-modern-coral transition-all duration-300 peer placeholder-transparent"
                  placeholder="Name"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.label
                  htmlFor="name"
                  className={`absolute left-6 transition-all duration-300 pointer-events-none ${
                    focusedField === "name" || formData.name
                      ? "-top-3 text-xs bg-white px-2 text-modern-coral font-semibold"
                      : "top-4 text-gray-500"
                  }`}
                >
                  Your Name
                </motion.label>
                
                {/* Animated border */}
                <AnimatePresence>
                  {focusedField === "name" && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-modern-coral to-modern-teal"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Email Field */}
              <div className="relative">
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-transparent rounded-xl focus:outline-none focus:border-modern-teal transition-all duration-300 peer placeholder-transparent"
                  placeholder="Email"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.label
                  htmlFor="email"
                  className={`absolute left-6 transition-all duration-300 pointer-events-none ${
                    focusedField === "email" || formData.email
                      ? "-top-3 text-xs bg-white px-2 text-modern-teal font-semibold"
                      : "top-4 text-gray-500"
                  }`}
                >
                  Your Email
                </motion.label>
                
                <AnimatePresence>
                  {focusedField === "email" && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-modern-teal to-modern-coral"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Message Field */}
              <div className="relative">
                <motion.textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-transparent rounded-xl focus:outline-none focus:border-vintage-sage transition-all duration-300 resize-none peer placeholder-transparent"
                  placeholder="Message"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.label
                  htmlFor="message"
                  className={`absolute left-6 transition-all duration-300 pointer-events-none ${
                    focusedField === "message" || formData.message
                      ? "-top-3 text-xs bg-white px-2 text-vintage-sage font-semibold"
                      : "top-4 text-gray-500"
                  }`}
                >
                  Your Message
                </motion.label>
                
                <AnimatePresence>
                  {focusedField === "message" && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-vintage-sage to-modern-coral"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-modern-coral to-modern-teal" />
                <div className="absolute inset-0 bg-gradient-to-r from-modern-teal to-modern-coral opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative block px-8 py-4 text-white font-bold text-lg">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⚡
                      </motion.span>
                      Sending...
                    </span>
                  ) : (
                    "Send Message 🚀"
                  )}
                </span>
                
                {/* Particle burst effect */}
                <AnimatePresence>
                  {showParticles && (
                    <motion.div className="absolute inset-0 pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-white rounded-full"
                          style={{
                            left: "50%",
                            top: "50%"
                          }}
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            x: (Math.random() - 0.5) * 200,
                            y: (Math.random() - 0.5) * 200,
                            opacity: [1, 1, 0]
                          }}
                          transition={{ duration: 0.8, delay: i * 0.02 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Character count for message */}
              {formData.message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-right text-gray-500"
                >
                  {formData.message.length} characters
                </motion.p>
              )}
            </form>
          </div>
        </Tilt>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 grid grid-cols-3 gap-4 text-center"
      >
        {[
          { value: "24h", label: "Response Time", icon: "⚡" },
          { value: "100%", label: "Commitment", icon: "💯" },
          { value: "∞", label: "Possibilities", icon: "🚀" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/30 hover:shadow-glow transition-all duration-300">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-modern-coral mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default Contact;