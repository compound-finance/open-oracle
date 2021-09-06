import { BigNumber } from "ethers";

export function uint(n: any) {
  if (typeof n === "number") {
    n = String(n);
  }
  return BigNumber.from(n);
}
