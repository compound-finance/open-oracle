import { ethers } from "ethers";

export function address(n: number) {
  const hex = `0x${n.toString(16).padStart(40, "0")}`;
  return ethers.utils.getAddress(hex);
}
