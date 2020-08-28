export default {
  NETLIFY_PORT: 62847,
  CONTRACT:
    process.env.NODE_ENV === "development"
      ? "KT19T89LoroCRbNWGDF4XyVeYTX9BUPcAv44"
      : "unknown"
};
