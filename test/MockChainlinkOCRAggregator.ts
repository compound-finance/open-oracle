import { smock } from "@defi-wonderland/smock";
import { BaseContract, BigNumberish } from "ethers";
import { UniswapAnchoredView, UniswapAnchoredView__factory } from "../types";

export interface MockChainlinkOCRAggregator extends BaseContract {
  functions: {
    setUniswapAnchoredView: (addr: string) => Promise<void>;
    validate: (price: BigNumberish) => Promise<void>;
  };
}

export async function createMockReporter() {
  let uniswapAnchoredView: UniswapAnchoredView;

  /// Mock reporter that validates against a UAV
  const reporter = await smock.fake<MockChainlinkOCRAggregator>([
    {
      inputs: [
        {
          internalType: "int256",
          name: "price",
          type: "int256",
        },
      ],
      name: "validate",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "addr",
          type: "address",
        },
      ],
      name: "setUniswapAnchoredView",
      stateMutability: "nonpayable",
      type: "function",
    },
  ]);
  reporter.setUniswapAnchoredView.returns((addr: string) => {
    uniswapAnchoredView = new UniswapAnchoredView__factory().attach(addr);
  });
  reporter.validate.returns(async (currentPrice: number) => {
    await uniswapAnchoredView.validate(0, 0, 0, currentPrice);
  });

  return reporter;
}
