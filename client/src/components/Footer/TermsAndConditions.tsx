import React, { useEffect, useState } from "react";
import config from "../../config";

const TermsAndConditions: React.FC = () => {
  const [terms, setTerms] = useState("");

  useEffect(() => {
    // fetches the terms and conditions from the IPFS
    (async () => {
      const req = await fetch(
        `https://gateway.pinata.cloud/ipfs/${config.termsIPFShash}`
      );
      const html = await req.text();
      setTerms(html);
    })();
  }, []);

  return (
    <div className="terms">
      <div dangerouslySetInnerHTML={{ __html: terms }}></div>
    </div>
  );
};

export default TermsAndConditions;
