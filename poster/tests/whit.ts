import Ganache from 'ganache-core';
import { ethers } from 'ethers';
import { promises as fs } from 'fs';

function deepMerge<T extends object>(a: T, b: T): T {
  return Object.entries(a).reduce<T>((acc, [k, v]) => {
    if (acc[k] && typeof(acc[k]) === 'object') {
      return {
        ...acc,
        [k]: deepMerge(acc[k], v)
      };
    } else if (acc[k] && Array.isArray(acc[k])) {
      return {
        ...acc,
        [k]: [...acc[k], ...v]
      };
    } else {
      return {
        ...acc,
        [k]: {
          ...acc[k],
          ...v
        }
      };
    }
  }, b);
}

class RefMissingError extends Error {
  ref: string
  contract: string

  constructor(ref, contract) {
    super(`Contract ${contract} referenced missing ref #${ref}`);

    this.name = 'RefMissingError'
    this.ref = ref;
    this.contract = contract;
  }
}

async function tryTo<T>(f: (() => Promise<T>) | (() => T), msg: string): Promise<T> {
  try {
    return await f();
  } catch (e) {
    console.error(msg);
    console.error(e);
    throw e;
  }
}
function asArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [ val ];
}

type Address = string
type Contract = unknown
type Refs = { [ref: string]: Contract }

interface WhitInfo {
  ethers: any
  provider : ethers.providers.Provider
  signer : ethers.Signer
  build: object,
  contract: (address: Address, contractName: string) => ethers.Contract
}

interface ContractReq {
  deploy: [string, any[]] | ((refs: any, whitInfo: WhitInfo) => Promise<ethers.Contract>)
  postDeploy?: (refs: any, whitInfo: WhitInfo) => Promise<any>
}

interface WhitSettings {
  provider: string | ethers.providers.Provider
  build: string | string[]
  contracts: { [name: string]: ContractReq }
}

type Build = {[contract: string]: ContractBuild};
type ContractBuild = {
  bin: string,
  abi: ethers.ContractInterface
}

export class Whit {
  refs: Refs;
  provider : ethers.providers.Provider
  build: object
  signer: ethers.Signer

  private constructor(provider: ethers.providers.Provider, signer: ethers.Signer, build: object, refs: Refs) {
    this.provider = provider;
    this.build = build;
    this.refs = refs;
    this.signer = signer;
  }

  static async getProvider(provider: string | ethers.providers.Provider): Promise<ethers.providers.Provider> {
    if (typeof(provider) === 'string') {
      if (provider === 'ganache') {
        return new ethers.providers.Web3Provider(<any>Ganache.provider({}));
      } else if (provider.startsWith('http')) {
        return new ethers.providers.JsonRpcProvider(provider);
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }
    } else {
      return provider;
    }
  }

  getContractBuild(contractName: string): ContractBuild {
    let contractBuild = this.build[contractName];
    if (contractBuild === undefined) { throw new Error(`Cannot find contract ${contractName} in given builds`); }
    if (contractBuild['abi'] === undefined) { throw new Error(`Contract ${contractName} build does not have ABI key`); }
    if (contractBuild['bin'] === undefined) { throw new Error(`Contract ${contractName} build does not have \`bin\` key`); }

    return contractBuild;
  }

  static async loadBuild(build: string): Promise<Build> {
    let jsonFile = await tryTo(() => fs.readFile(build, 'utf8'), `Error reading build file: ${build}`);
    let json = await tryTo(() => JSON.parse(jsonFile), `Error parsing build file: ${build}`);
    if (!json['contracts']) {
      throw new Error(`Invalid build file, missing key \`contracts\``);
    }
    let contracts = json['contracts'];

    return Object.fromEntries(
      Object.entries(contracts).map(([k, v]) => {
        let {
          abi,
          bin,
          metadata
        } = <any>v;

        let build = {
          ...<object>v,
          abi: typeof(abi) === 'string' ? JSON.parse(abi) : abi,
          bin,
          metadata: typeof(metadata) === 'string' ? JSON.parse(metadata) : metadata,
        };

        return [
          k.split(':')[1],
          build
        ];
      })
    );
  }

  private whitInfo() {
    return {
      ethers,
      build: this.build,
      provider: this.provider,
      signer: this.signer,
      contract: (address, contractName) => {
        let { abi } = this.getContractBuild(contractName);
        return new ethers.Contract(address, abi, this.signer);
      }
    };
  }

  private async buildStep(contracts, refs, ref, conf): Promise<{type: 'not_found'} | {type: 'contract', contract: ethers.Contract}> {
    // Let's try and deploy this current contract and if it works, hooray!
    let refsThrow = Object.entries(contracts).reduce((refs, [contract, conf]) => {
      if (refs[contract] === undefined) {
        Object.defineProperty( // Apparently cloning the object here causes the all of the keys to be evaluated
          refs,
          contract,
          {
            get: function() {
              throw new RefMissingError(ref, contract);
            }
          }
        );

        return refs;
      } else {
        return refs;
      }
    }, refs);

    if (typeof(conf.deploy) === 'function') {
      try {
        let contract = await conf.deploy(refsThrow, this.whitInfo());
        if (!(contract instanceof ethers.Contract)) {
          throw new Error(`Ref #${ref} returned invalid object from deploy. Expecting ethers.Contract, got: ${typeof(contract)} ${JSON.stringify(contract)}`);
        }
        return { type: 'contract', contract };
      } catch (e) {
        if (e instanceof RefMissingError) {
          return { type: 'not_found' };
        } else {
          console.error("Error deploying " + ref);
          throw e;
        }
      }
    } else if (Array.isArray(conf.deploy) && conf.deploy.length === 2) {
      let [contractName, args] = conf.deploy;
      let { abi, bin } = this.getContractBuild(contractName);
      let factory = new ethers.ContractFactory(abi, bin, this.signer);
      let contract = await factory.deploy(...args);
      await contract.deployTransaction.wait();
      // TODO: we'll need smart args here
      return {
        type: 'contract',
        contract: contract
      };
    } else {
      throw new Error(`Invalid deploy function for ${ref}, got \`${conf.deploy}\``)
    }
  }

  async buildContracts(contracts: { [name: string]: ContractReq }, refs?: Refs): Promise<Whit> {
    let refsPre = refs === undefined ? this.refs : refs;

    let refsPost = await Object.entries(contracts).reduce<Promise<Refs>>(async (refsP, [ref, conf]) => {
      let refs = await refsP;
      let result = await this.buildStep(contracts, {...refs}, ref, conf);

      if (result.type === 'not_found') {
        // This ref can't be built yet, let's keep moving on
        return refs;
      } else {
        let { contract } = result;
        refs = Object.assign(
          refs,
          { [ref]: contract }
        ); // Cannot immutably set here
        if (typeof(conf.postDeploy) === 'function') {
          await conf.postDeploy(refs, this.whitInfo());
        }
        return refs;
      }
    }, Promise.resolve({...refsPre}));

    let missingContractsPre = Object.entries(contracts).filter(([k, v]) => refsPre[k] === undefined);
    let missingContractsPost = Object.entries(contracts).filter(([k, v]) => refsPost[k] === undefined);

    // Check to see if we made any progress this pass
    if (missingContractsPre.length === missingContractsPost.length && missingContractsPost.length > 0) {
      console.log({missingContractsPre, missingContractsPost})
      throw new Error(`Failed to build... yada yada yada`);
    }

    // Check to see if we need to do another pass
    if (missingContractsPost.length > 0) {
      return this.buildContracts(Object.fromEntries(missingContractsPost), refsPost);
    }

    // We're done, let's pack it up
    return new Whit(this.provider, this.signer, this.build, refsPost);
  }

  static async init(settings: WhitSettings): Promise<Whit> {
    let provider = await Whit.getProvider(settings.provider);
    let build = (await Promise.all(asArray(settings.build).map(Whit.loadBuild))).reduce(deepMerge);
    let signer = await (<any>provider).getSigner(0); // TODO: Is this right?
    let whit = new Whit(provider, signer, build, {});

    return await whit.buildContracts(settings.contracts);
  }
}
