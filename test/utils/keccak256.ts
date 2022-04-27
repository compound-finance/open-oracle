import { ethers } from "hardhat";

export function keccak256(str: string) {
  return ethers.utils.solidityKeccak256(["string"], [str]);
}
