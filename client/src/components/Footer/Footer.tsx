import React from "react";
import { Link } from "react-router-dom";
import config from "../../config";

const Footer: React.FC = () => {
  return (
    <footer>
      <div>
        <Link to="/terms">Terms and conditions</Link>
      </div>
      <div>
        <span className="address-display">v{config.version}</span>{" "}
        <a
          href={`https://better-call.dev/carthagenet/${
            config.CONTRACT[config.ENV]
          }/operations`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="far fa-file-code"></i>
        </a>
        <a
          href="https://github.com/claudebarde/pixel-art-nfts"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-github"></i>
        </a>
        <a
          href="https://better-call.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="bcd-icon"
        >
          BCD
        </a>
      </div>
    </footer>
  );
};

export default Footer;
