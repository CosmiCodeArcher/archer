import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tilt } from "react-tilt";

function MeetingScheduler() {
  const [step, setStep] = useState(1);
  const [selectedMeetingType, setSelectedMeetingType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", notes: "" });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showConfetti, setShowConfetti] = useState(false);
  const [userTimezone, setUserTimezone] = useState("");

  useEffect(() => {
    // Detect user timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
  }, []);

  const meetingTypes = [
    {
      id: "quick-chat",
      title: "Quick Chat",
      duration: "15 min",
      icon: "💬",
      description: "Quick introduction or question",
      color: "from-blue-400 to-cyan-400",
    },
    {
      id: "project-discussion",
      title: "Project Discussion",
      duration: "30 min",
      icon: "💼",
      description: "Discuss your project in detail",
      color: "from-modern-coral to-orange-400",
    },
    {
      id: "consultation",
      title: "Consultation",
      duration: "60 min",
      icon: "🚀",
      description: "Deep dive into requirements",
      color: "from-modern-teal to-green-400",
    },
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    return date >= today && dayOfWeek !== 0 && dayOfWeek !== 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Combine date and time, and append user's timezone offset
    const [hourStr, minuteStr] = selectedTime.split(/[:\s]/);
    let hours = parseInt(hourStr, 10);
    const isPm = selectedTime.toLowerCase().includes("pm");

    if (isPm && hours < 12) {
      hours += 12;
    } else if (!isPm && hours === 12) {
      hours = 0; // 12 AM is 00 in 24-hour format
    }

    const localDateTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
                                   hours, parseInt(minuteStr, 10), 0);
    
    const payload = {
      name: formData.name,
      email: formData.email,
      notes: formData.notes,
      dateTime: localDateTime.toISOString(), // Send full ISO string with local timezone
      duration: parseInt(selectedMeetingType.duration.split(" ")[0]),
      type: selectedMeetingType.title,
    };
  
    try {
      const res = await fetch("/.netlify/functions/schedule-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      // Safer: Check if response is OK first
      if (!res.ok) {
        const text = await res.text();  // Get raw text (handles HTML 404)
        console.error("Server response:", text);
        alert(`Error ${res.status}: ${text.substring(0, 100)}...`);
        return;
      }
  
      const data = await res.json();
      console.log("Success:", data);
  
      setShowConfetti(true);
      setStep(4);
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to connect. Check console or try refreshing.");
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-beige via-vintage-sage to-modern-teal dark:from-gray-900 dark:via-teal-900/30 dark:to-cyan-900/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl md:text-8xl mb-4"
          >
            📅
          </motion.div>
          <h1 className="cool-text text-3xl md:text-5xl font-bold mb-4" data-text="Schedule a Meeting">
            Schedule a Meeting
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
            Let's connect and discuss your project. Choose a time that works for you!
          </p>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            🌍 Your timezone: <span className="font-bold text-modern-coral">{userTimezone}</span>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 md:gap-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <motion.div
                  animate={{
                    scale: step >= num ? 1.1 : 1,
                    backgroundColor: step >= num ? "#FF7F50" : "#e5e7eb",
                  }}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold ${
                    step >= num ? "text-white" : "text-gray-400"
                  }`}
                >
                  {step > num ? "✓" : num}
                </motion.div>
                {num < 3 && (
                  <div className={`w-12 md:w-24 h-1 mx-2 ${step > num ? "bg-modern-coral" : "bg-gray-300 dark:bg-gray-700"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {meetingTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Tilt options={{ max: 15, scale: 1.03 }}>
                    <div
                      onClick={() => {
                        setSelectedMeetingType(type);
                        setStep(2);
                      }}
                      className={`cursor-pointer bg-gradient-to-br ${type.color} p-0.5 rounded-2xl h-full`}
                    >
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 rounded-2xl h-full hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 border dark:border-modern-teal/30">
                        <div className="text-5xl mb-4 text-center">{type.icon}</div>
                        <h3 className="text-xl font-bold mb-2 text-center dark:text-white">{type.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-200 text-center mb-2 font-medium">
                          {type.description}
                        </p>
                        <div className="text-center">
                          <span className="inline-block px-4 py-2 bg-gradient-to-r from-modern-coral to-modern-teal text-white rounded-full text-sm font-bold">
                            {type.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </motion.div>
          )}

          {step === 2 && selectedMeetingType && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/30 dark:border-modern-teal/30"
            >
              <div className="flex justify-between items-center mb-6">
                <motion.button
                  onClick={() => setStep(1)}
                  className="text-modern-coral hover:text-modern-teal transition-colors duration-300 flex items-center gap-2 font-medium"
                  whileHover={{ x: -5 }}
                >
                  ← Back
                </motion.button>
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-bold dark:text-white">Select Date & Time</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedMeetingType.title} - {selectedMeetingType.duration}
                  </p>
                </div>
                <div className="w-16" />
              </div>

              {/* Calendar Navigation */}
              <div className="flex justify-between items-center mb-6">
                <motion.button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 bg-modern-coral text-white rounded-lg hover:bg-modern-teal transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ←
                </motion.button>
                <h4 className="text-lg md:text-xl font-bold dark:text-white">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>
                <motion.button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 bg-modern-coral text-white rounded-lg hover:bg-modern-teal transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  →
                </motion.button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-bold text-sm text-gray-600 dark:text-gray-300">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentMonth).map((date, index) => {
                  const available = isDateAvailable(date);
                  const isSelected = selectedDate && date && 
                    date.toDateString() === selectedDate.toDateString();
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => available && setSelectedDate(date)}
                      disabled={!available}
                      className={`aspect-square rounded-lg text-sm md:text-base font-medium transition-all duration-300 ${
                        !date
                          ? "invisible"
                          : isSelected
                          ? "bg-gradient-to-br from-modern-coral to-modern-teal text-white shadow-glow"
                          : available
                          ? "bg-white/50 dark:bg-gray-700/50 hover:bg-modern-teal/20 dark:hover:bg-modern-teal/30 text-gray-800 dark:text-white"
                          : "bg-gray-200 dark:bg-gray-900 text-gray-400 cursor-not-allowed"
                      }`}
                      whileHover={available ? { scale: 1.1 } : {}}
                      whileTap={available ? { scale: 0.95 } : {}}
                    >
                      {date?.getDate()}
                    </motion.button>
                  );
                })}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <h4 className="text-lg font-bold mb-4 dark:text-white">Available Times</h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {timeSlots.map((time) => (
                      <motion.button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setStep(3);
                        }}
                        className={`p-3 rounded-lg font-medium transition-all duration-300 ${
                          selectedTime === time
                            ? "bg-gradient-to-br from-modern-coral to-modern-teal text-white"
                            : "bg-white/50 dark:bg-gray-700/50 hover:bg-modern-teal/20 dark:hover:bg-modern-teal/30 text-gray-800 dark:text-white"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/30 dark:border-modern-teal/30"
            >
              <div className="flex justify-between items-center mb-6">
                <motion.button
                  onClick={() => setStep(2)}
                  className="text-modern-coral hover:text-modern-teal transition-colors duration-300 flex items-center gap-2 font-medium"
                  whileHover={{ x: -5 }}
                >
                  ← Back
                </motion.button>
                <h3 className="text-xl md:text-2xl font-bold dark:text-white">Confirm Details</h3>
                <div className="w-16" />
              </div>

              {/* Meeting Summary */}
              <div className="bg-gradient-to-r from-modern-coral/10 to-modern-teal/10 dark:from-modern-coral/20 dark:to-modern-teal/20 p-6 rounded-2xl mb-6 border dark:border-modern-teal/30">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{selectedMeetingType.icon}</span>
                  <div>
                    <h4 className="font-bold text-lg dark:text-white">{selectedMeetingType.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-200">{selectedMeetingType.duration}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">📅 Date:</span>
                    <p className="font-bold dark:text-white">{selectedDate?.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">⏰ Time:</span>
                    <p className="font-bold dark:text-white">{selectedTime}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-200">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border-2 border-transparent rounded-xl focus:outline-none focus:border-modern-coral transition-all duration-300 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-200">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border-2 border-transparent rounded-xl focus:outline-none focus:border-modern-teal transition-all duration-300 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-200">Additional Notes (Optional)</label>
                  <textarea
                    rows="4"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border-2 border-transparent rounded-xl focus:outline-none focus:border-vintage-sage transition-all duration-300 resize-none dark:text-white"
                    placeholder="Tell me what you'd like to discuss..."
                  />
                </div>
                <motion.button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-modern-coral to-modern-teal text-white font-bold text-lg rounded-xl hover:shadow-glow transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirm Meeting 🎉
                </motion.button>
              </form>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Confetti */}
              {showConfetti && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                  {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        background: i % 2 === 0 ? "#FF7F50" : "#00CED1",
                        left: `${Math.random() * 100}%`,
                        top: "-10%",
                      }}
                      animate={{
                        y: ["0vh", "110vh"],
                        rotate: [0, 360],
                        opacity: [1, 0.8, 0],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        delay: i * 0.02,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/30 dark:border-modern-teal/30 max-w-2xl mx-auto">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 1 }}
                  className="text-7xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-modern-coral">Meeting Scheduled!</h2>
                <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                  Thank you, {formData.name}! Your meeting has been confirmed.
                </p>
                <div className="bg-gradient-to-r from-modern-coral/10 to-modern-teal/10 dark:from-modern-coral/20 dark:to-modern-teal/20 p-6 rounded-2xl mb-6 text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    📅 <strong className="dark:text-white">{selectedDate?.toLocaleDateString()}</strong> at <strong className="dark:text-white">{selectedTime}</strong>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    📧 Confirmation sent to <strong className="dark:text-white">{formData.email}</strong>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    🔗 Meeting link will be sent 15 minutes before the call
                  </p>
                </div>
                <motion.a
                  href="/"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-modern-coral to-modern-teal text-white font-bold rounded-xl hover:shadow-glow transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Home
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MeetingScheduler;