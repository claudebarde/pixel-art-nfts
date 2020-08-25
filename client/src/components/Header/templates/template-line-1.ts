import colors from "./colors";

const positionsLine1: number[] = [
  1,
  2,
  3,
  7,
  8,
  9,
  12,
  15,
  18,
  19,
  20,
  21,
  24,
  34,
  35,
  39,
  40,
  41,
  45,
  46,
  47,
  53,
  56,
  60,
  61,
  62,
  63,
  66,
  67,
  68,
  71,
  72,
  73,
  74
];

const line1: string[] = Array(76)
  .fill("0")
  .map((pos, i) => {
    if (positionsLine1.includes(i)) {
      return colors[Math.floor(Math.random() * colors.length)];
    } else {
      return "0";
    }
  });

export default line1;
