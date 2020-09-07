const axios = require("axios");
const crypto = require("crypto");

exports.handler = async (event, context) => {
  try {
    const { canvas, size, author, name, artistName } = JSON.parse(event.body);
    // creates canvas hash
    const secret = "taquito";
    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(canvas))
      .digest("hex");
    const timestamp = Date.now();

    // checks if the pixel art doesn't already exist
    const checkHash = `https://api.pinata.cloud/data/pinList?status=pinned&metadata[name]=`;
    const rsp = await axios.get(checkHash + hash, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
      }
    });
    if (rsp.data.count === 1) {
      // a token exists with the exact same hash
      return {
        statusCode: 500,
        body: "TOKEN_ALREADY_EXISTS",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
        }
      };
    } else {
      // pins pixel art
      const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

      const response = await axios.post(
        url,
        {
          pinataOptions: { cidVersion: 0 },
          pinataMetadata: {
            name: hash,
            keyvalues: {
              author,
              origin: "pixel-art-nfts",
              size,
              author,
              artistName,
              timestamp
            }
          },
          pinataContent: {
            hash,
            name,
            author,
            canvas,
            size,
            artistName,
            createdOn: timestamp
          }
        },
        {
          headers: {
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
          }
        }
      );
      //console.log("axios response:", response.data);
      return {
        statusCode: 200,
        body: JSON.stringify({
          hash,
          timestamp,
          ipfsHash: response.data.IpfsHash
        }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
        }
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: err.toString(),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
      }
    };
  }
};
