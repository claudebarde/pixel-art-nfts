const axios = require("axios");

exports.handler = async (event, context) => {
  console.log(event.body);
  try {
    // fetches a list of artwork
    const url = `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=30&metadata[keyvalues]={"origin":{"value":"pixel-art-nfts","op":"eq"}}`;

    const response = await axios.get(url, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
      }
    });
    //console.log("axios response:", response.data);
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST"
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
