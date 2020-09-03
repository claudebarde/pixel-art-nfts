import React, { useContext } from "react";
import { Context } from "../../Context";

const Footer: React.FC = () => {
  const { userAddress } = useContext(Context);

  return (
    <footer>
      <div className="address-display">
        {userAddress &&
          `Connected as ${
            userAddress.slice(0, 5) + "..." + userAddress.slice(-5)
          }`}
      </div>
      <div>
        <a
          href="https://better-call.dev/carthagenet/KT1PJnTttEsEFFaHeLnbKJmzwfxuVvEBkq1b/operations"
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
      </div>
    </footer>
  );
};

export default Footer;
