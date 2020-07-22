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
type Refs = { [ref: string]: ethers.Contract }

interface WhitInfo {
  ethers: any
  provider: ethers.providers.Provider
  signer: ethers.Signer
  account: Address
  build: object,
  contract: (address: Address, contractName: string) => ethers.Contract
  wait: (trxRespPromise: Promise<ethers.providers.TransactionResponse>, confirmations?: number) => Promise<ethers.providers.TransactionResponse>
}

interface ContractReq {
  deploy: [string, any[]] | ((refs: any, whitInfo: WhitInfo) => Promise<ethers.Contract>)
  postDeploy?: (refs: any, whitInfo: WhitInfo) => Promise<any>
}

type WhitSettingsProvider = string | { http: string } | { ganache: object } | ethers.providers.Provider
type WhitSettingsSigner = { account: number } | { file: string }
interface WhitSettings {
  provider: WhitSettingsProvider
  signer?: WhitSettingsSigner
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
  account: Address
  settings: WhitSettings

  private constructor(provider: ethers.providers.Provider, signer: ethers.Signer, account: Address, build: object, settings: WhitSettings, refs: Refs) {
    this.provider = provider;
    this.build = build;
    this.refs = refs;
    this.signer = signer;
    this.account = account;
    this.settings = settings;
  }

  static async getProvider(provider: WhitSettingsProvider): Promise<ethers.providers.Provider> {
    if (typeof(provider) === 'string') {
      return new ethers.providers.JsonRpcProvider(provider);
    } else {
      if (provider['ganache']) {
        return new ethers.providers.Web3Provider(<any>Ganache.provider((<any>provider).ganache));
      } else if (provider['http']) {
        return new ethers.providers.JsonRpcProvider(provider['http']);
      } else if (provider['_isProvider']) {
        return <ethers.providers.Provider>provider;
      } else {
        throw new Error(`Unknown provider: ${JSON.stringify(provider)}`)
      }
    }
  }

  getWeb3Provider(): any {
    let providerSettings = this.settings.provider;

    if (typeof(providerSettings) === 'string') {
      return providerSettings;
    } else {
      if (providerSettings['ganache']) {
        return (<any>this.provider).provider;
      } else if (providerSettings['http']) {
        return providerSettings['http'];
      } else if (providerSettings['_isProvider']) {
        throw new Error(`Unable to use Ethers provider: ${JSON.stringify(providerSettings)}`)
      } else {
        throw new Error(`Unknown provider: ${JSON.stringify(providerSettings)}`)
      }
    }
  }

  static async getSigner(signer: WhitSettingsSigner | undefined, provider: ethers.providers.Provider): Promise<ethers.Signer> {
    signer = signer === undefined ? { account: 0 } : signer;
    let account = signer['account'];
    let file = signer['file'];

    if (account !== undefined) {
      return (<any>provider).getSigner(account); // TODO: Is this right?
    } else if (file !== undefined) {
      let key = (await tryTo(() => fs.readFile(file, 'utf8'), `Error reading signer file: ${signer['file']}`)).trim();
      let keyCleaned = key.startsWith('0x') ? key : `0x${key}`;
      return new ethers.Wallet(keyCleaned, provider);
    } else {
      throw new Error(`Unknown or invalid signer: ${JSON.stringify(signer)}`);
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

    return Object.entries(contracts).reduce<Build>((acc, [k, v]) => {
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

      let simpleKey = k.split(':')[1];

      return {
        ...acc,
        [simpleKey]: build,
        [k]: build
      };
    }, {});
  }

  getAddress(ref: string): Address {
    let contract = this.refs[ref];
    if (contract === undefined) {
      throw new Error(`Whit: Cannot find ref #${ref} [refs: ${Object.keys(this.refs).join(', ')}]`);
    }
    let address = contract.address;
    if (address === undefined) {
      throw new Error(`Whit: Ref #${ref} has no address [ref: ${JSON.stringify(ref)}]`);
    }
    return address;
  }

  static async wait(trxRespPromise: Promise<ethers.providers.TransactionResponse>, confirmations: number = 1): Promise<ethers.providers.TransactionResponse> {
    let trxResp = await trxRespPromise;
    await trxResp.wait(confirmations);
    return trxResp;
  }

  private whitInfo() {
    return {
      ethers,
      build: this.build,
      provider: this.provider,
      signer: this.signer,
      account: this.account,
      wait: Whit.wait,
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
      let [contractName, argsRaw] = conf.deploy;
      let args = argsRaw.map((arg) => {
        if (typeof(arg) === 'object' && arg.hasOwnProperty('ref')) {
          return refsThrow[arg.ref].address;
        } else if (typeof(arg) === 'object' && arg.hasOwnProperty('account')) {
          if (arg.account === 0) {
            return this.account;
          } else {
            throw new Error(`Account arg must be zero, got: ${arg.account}`);
          }
        } else {
          return arg;
        }
      });
      let { abi, bin } = this.getContractBuild(contractName);
      let factory = new ethers.ContractFactory(abi, bin, this.signer);
      let contract = await factory.deploy(...args);
      await contract.deployed();
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
    return new Whit(this.provider, this.signer, this.account, this.build, this.settings, refsPost);
  }

  static async init(settings: WhitSettings): Promise<Whit> {
    let provider = await Whit.getProvider(settings.provider);
    let build = (await Promise.all(asArray(settings.build).map(Whit.loadBuild))).reduce(deepMerge);
    let signer = await Whit.getSigner(settings.signer, provider);
    let account = await signer.getAddress();
    let whit = new Whit(provider, signer, account, build, settings, {});

    return await whit.buildContracts(settings.contracts);
  }
}
