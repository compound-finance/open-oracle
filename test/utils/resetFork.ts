import { network, config } from "hardhat";

/**
 * Resets the state of the forked network to the original block number.
 */
export async function resetFork() {
  const { url, blockNumber } = config.networks.hardhat.forking!;
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: url,
          blockNumber,
        },
      },
    ],
  });
}
