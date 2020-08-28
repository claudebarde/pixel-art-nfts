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
            artistName
          }
        },
        pinataContent: {
          hash,
          name,
          author,
          canvas,
          size,
          artistName
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
      body: JSON.stringify({ hash, timestamp, ipfsHash: response.data }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
      }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.toString() }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
      }
    };
  }
};
