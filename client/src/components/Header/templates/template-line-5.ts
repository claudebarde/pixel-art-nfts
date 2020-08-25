import colors from "./colors";

const positionsLine5: number[] = [
  1,
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
  25,
  26,
  27,
  33,
  36,
  39,
  42,
  46,
  53,
  56,
  60,
  67,
  71,
  72,
  73,
  74
];

const line5: string[] = Array(76)
  .fill("0")
  .map((pos, i) => {
    if (positionsLine5.includes(i)) {
      return colors[Math.floor(Math.random() * colors.length)];
    } else {
      return "0";
    }
  });

export default line5;
