import { BigNumber } from "ethers";

export function exp(a: any, b: any) {
  return BigNumber.from(a).mul(BigNumber.from("10").pow(b));
}
