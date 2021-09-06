import { Signer } from "ethers";
import { EthersContracts } from "typechain-common-abi";

export function getErc20ContractAt(address: string, signer: Signer) {
  return new EthersContracts.ERC20__factory(signer).attach(address);
}

// Mainnet WETH
export function getWeth9(signer: Signer) {
  return new EthersContracts.WETH9__factory(signer).attach(
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  );
}
