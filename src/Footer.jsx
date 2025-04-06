import PropTypes from "prop-types";

function Footer({ onSectionChange }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-layout">
          <div className="footer-text-center">
            <img
              src="/Awodi.png"
              alt="Awodi Logo"
              className="footer-logo"
            />
            <p className="footer-desc">
              Creating responsive and user-friendly web experiences
            </p>
          </div>
          <div className="text-center">
            <nav className="footer-nav">
              <button
                type="button"
                onClick={() => onSectionChange("portfolio")}
                className="footer-button pointer-events-auto hover:scale-105 transition-all duration-300"
              >
                Portfolio
              </button>
              <button
                type="button"
                onClick={() => onSectionChange("about")}
                className="footer-button pointer-events-auto hover:scale-105 transition-all duration-300"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => onSectionChange("contact")}
                className="footer-button pointer-events-auto hover:scale-105 transition-all duration-300"
              >
                Contact
              </button>
            </nav>
          </div>
          <div className="footer-text-right">
            <div className="social-container">
              <a
                href="https://github.com/Ochiponu-Awodi"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link text-gray-700 hover:scale-110 transition-all duration-300"
                aria-label="GitHub"
              >
                <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.26.793-.577v-2.234c-3.338.724-4.043-1.607-4.043-1.607-.546-1.387-1.333-1.757-1.333-1.757-1.087-.744.083-.729.083-.729 1.205.085 1.838 1.238 1.838 1.238 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.932 0-1.31.467-2.381 1.235-3.221-.124-.304-.535-1.527.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02-.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.649.242 2.872.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.807 5.625-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/awodi-ochiponu-b10126204"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link text-gray-700 hover:scale-110 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764S5.534 3.204 6.5 3.204c.966 0 1.75.79 1.75 1.764S7.466 6.732 6.5 6.732zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-copyright">
            <p>© {currentYear} Awodi. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  onSectionChange: PropTypes.func.isRequired,
};

export default Footer;
                    