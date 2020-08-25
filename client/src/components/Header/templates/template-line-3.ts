import colors from "./colors";

const positionsLine3: number[] = [
  1,
  2,
  3,
  8,
  13,
  14,
  18,
  19,
  20,
  24,
  33,
  34,
  35,
  36,
  39,
  40,
  41,
  46,
  53,
  55,
  56,
  60,
  61,
  62,
  67,
  71,
  72,
  73,
  74
];

const line3: string[] = Array(76)
  .fill("0")
  .map((pos, i) => {
    if (positionsLine3.includes(i)) {
      return colors[Math.floor(Math.random() * colors.length)];
    } else {
      return "0";
    }
  });

export default line3;
