import colors from "./colors";

const positionsLine2: number[] = [
  1,
  4,
  8,
  12,
  15,
  18,
  24,
  33,
  36,
  39,
  42,
  46,
  53,
  54,
  56,
  60,
  67,
  71
];

const line2: string[] = Array(76)
  .fill("0")
  .map((pos, i) => {
    if (positionsLine2.includes(i)) {
      return colors[Math.floor(Math.random() * colors.length)];
    } else {
      return "0";
    }
  });

export default line2;
