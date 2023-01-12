import { ethers } from "hardhat";
import { BigNumber } from "ethers";

const TARGET_RATIO = ethers.BigNumber.from("1000000000000000000");

export const ANCHOR_PRICES = {
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ETH"))}`]: {
    anchor: ethers.BigNumber.from("3950860042"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DAI"))}`]: {
    anchor: ethers.BigNumber.from("1002405"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BTC"))}`]: {
    anchor: ethers.BigNumber.from("49884198916"),
    multiplier: ethers.BigNumber.from("1000000"),
    baseUnit: ethers.BigNumber.from("100000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BAT"))}`]: {
    anchor: ethers.BigNumber.from("879861"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ZRX"))}`]: {
    anchor: ethers.BigNumber.from("1156381"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REP"))}`]: {
    anchor: ethers.BigNumber.from("29578072"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UNI"))}`]: {
    anchor: ethers.BigNumber.from("30094199"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("COMP"))}`]: {
    anchor: ethers.BigNumber.from("477896498"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LINK"))}`]: {
    anchor: ethers.BigNumber.from("31197271"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("AAVE"))}`]: {
    anchor: ethers.BigNumber.from("403308857"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SUSHI"))}`]: {
    anchor: ethers.BigNumber.from("13476839"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SUSHI"))}`]: {
    anchor: ethers.BigNumber.from("13476839"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MKR"))}`]: {
    anchor: ethers.BigNumber.from("3606500267"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YFI"))}`]: {
    anchor: ethers.BigNumber.from("39060773573"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FEI"))}`]: {
    anchor: ethers.BigNumber.from("1156034"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
  [`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MATIC"))}`]: {
    anchor: ethers.BigNumber.from("1463577"),
    multiplier: ethers.BigNumber.from("10000000000000000"),
    baseUnit: ethers.BigNumber.from("1000000000000000000"),
  },
};

export const MOCK_REPORTED_PRICES = Object.keys(ANCHOR_PRICES).reduce(
  (prev, curr) => {
    const { anchor, multiplier, baseUnit } = ANCHOR_PRICES[curr];
    const reportedPriceWithinAnchor = anchor
      .mul(ethers.utils.parseEther("1"))
      .mul(baseUnit)
      .div(TARGET_RATIO)
      .div(multiplier);
    prev[curr] = reportedPriceWithinAnchor;
    return prev;
  },
  {} as { [T: string]: BigNumber }
);
