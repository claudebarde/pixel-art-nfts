import colors from "./colors";

const positionsLine4: number[] = [
  1,
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
  56,
  60,
  67,
  74
];

const line4: string[] = Array(76)
  .fill("0")
  .map((pos, i) => {
    if (positionsLine4.includes(i)) {
      return colors[Math.floor(Math.random() * colors.length)];
    } else {
      return "0";
    }
  });

export default line4;
