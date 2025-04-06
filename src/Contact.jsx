function Contact() {
    const handleSubmit = (e) => {
      e.preventDefault();
      const form = e.target;
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      })
        .then(() => {
          window.location.href = "/success";
        })
        .catch((error) => alert(error));
    };
  
    return (
      <div className="contact-container">
        <h2 className="contact-heading">Contact Me</h2>
        <p className="contact-intro">
          I am always open to new opportunities and collaborations. Feel free to reach out!
        </p>
  
        <div className="contact-info">
          <ul className="contact-list">
            <li className="contact-item">
              <span className="contact-label">Email:</span>
              <div className="contact-link-container">
                <span className="contact-email">awodiomale@gmail.com</span>
                <a
                  href="mailto:awodiomale@gmail.com"
                  className="contact-link pointer-events-auto"
                >
                  (Click to email)
                </a>
              </div>
            </li>
            <li className="contact-item">
              <span className="contact-label">LinkedIn:</span>
              <a
                href="https://www.linkedin.com/in/awodi-ochiponu-b10126204"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                linkedin.com/in/awodi-ochiponu
              </a>
            </li>
            <li className="contact-item">
              <span className="contact-label">GitHub:</span>
              <a
                href="https://github.com/Ochiponu-Awodi"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                github.com/Ochiponu-Awodi
              </a>
            </li>
          </ul>
        </div>
  
        <div className="form-section">
          <h3 className="form-heading">Send me a message</h3>
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            onSubmit={handleSubmit}
            className="contact-form"
          >
            <input type="hidden" name="form-name" value="contact" />
  
            <div className="input-group">
              <label htmlFor="name" className="input-label">
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input-field"
              />
            </div>
  
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input-field"
              />
            </div>
  
            <div className="input-group">
              <label htmlFor="message" className="input-label">
                Message:
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows="4"
                className="textarea-field"
              />
            </div>
  
            <button type="submit" className="form-button">
              Send Message
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  export default Contact;