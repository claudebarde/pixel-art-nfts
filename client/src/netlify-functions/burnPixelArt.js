const axios = require("axios");

exports.handler = async (event, context) => {
  try {
    const ipfsHash = event.body; // IPFS hash to remove

    // pins pixel art
    const checkHash = `https://api.pinata.cloud/data/pinList?status=pinned&hashContains=`;
    const urlToUnpin = `https://api.pinata.cloud/pinning/unpin/`;
    // checks if hash is pinned
    const rsp = await axios.get(checkHash + ipfsHash, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
      }
    });
    if (rsp.data.count === 1) {
      // removes hash
      const response = await axios.delete(urlToUnpin + ipfsHash, {
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
        }
      });

      return {
        statusCode: 200,
        body: JSON.stringify(response.data),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
        }
      };
    } else {
      return {
        statusCode: 500,
        body: "NO_HASH",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
        }
      };
    }
    //console.log("axios response:", response.data);
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
