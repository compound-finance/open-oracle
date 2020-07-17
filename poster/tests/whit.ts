import Ganache from 'ganache-core';
import { ethers } from 'ethers';
import { promises as fs } from 'fs';

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
  build: object
}

interface ContractReq {
  deploy: [string, any[]] | ((refs: any, whitInfo: WhitInfo) => Promise<ethers.Contract>)
  postDeploy?: (contract: ethers.Contract, refs: any) => Promise<any>
}

interface WhitSettings {
  provider: string | ethers.providers.Provider
  build: string | string[]
  contracts: { [name: string]: ContractReq }
}

type Build = {[contract: string] : {
  bin: string
}};

export class Whit {
  refs: Refs;
  provider : ethers.providers.Provider
  build: object

  private constructor(provider: ethers.providers.Provider, build: object, refs: Refs) {
    this.provider = provider;
    this.build = build;
    this.refs = refs;
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

  static async loadBuild(build: string): Promise<Build> {
    let jsonFile = await tryTo(() => fs.readFile(build, 'utf8'), `Error reading build file: ${build}`);
    let json = await tryTo(() => JSON.parse(jsonFile), `Error parsing build file: ${build}`);
    if (!json['contracts']) {
      throw new Error(`Invalid build file, missing key \`contracts\``);
    }
    let contracts = json['contracts'];

    return <Build>
      Object.fromEntries(
        Object.entries(contracts).map(([k, v]) => [k.split(':')[1], v])
      );
  }

  private async buildStep(contracts, refs, ref, conf): Promise<{type: 'not_found'} | {type: 'contract', contract: ethers.Contract}> {
    // Let's try and deploy this current contract and if it works, hooray!
    console.log("a", contracts, refs);
    let refsThrow = Object.entries(contracts).reduce((refs, [contract, conf]) => {
      console.log("aa", refs, contract);
      console.log("aaa", refs[contract]);
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
        let contract = await conf.deploy(refsThrow, {ethers, build: this.build, provider: this.provider});
        console.log({contract})
        if (!(contract instanceof ethers.Contract)) {
          throw new Error(`Ref #${ref} returned invalid object from deploy. Expecting ethers.Contract, got: ${typeof(contract)} ${JSON.stringify(contract)}`);
        }
        return { type: 'contract', contract };
      } catch (e) {
        if (e instanceof RefMissingError) {
          return { type: 'not_found' };
        } else {
          console.log("eeeeeeeee", e);
          throw e;
        }
      }
    } else if (Array.isArray(conf.deploy) && conf.deploy.length === 2) {
      let [contract, args] = conf.deploy;
      let build = this.build[contract];
      let signer = (<any>this.provider).getSigner(0);
      let factory = new ethers.ContractFactory(build.abi, build.bin, signer); // TODO: Wallet
      console.log({factory, args});
      // TODO: we'll need smart args here
      return {
        type: 'contract',
        contract: await factory.deploy(...args)
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
        Object.defineProperty(refs, ref, contract); // Cannot immutably set here
        console.log({refs});
        if (typeof(conf.postDeploy) === 'function') {
          await conf.postDeploy(contract, refs);
        }
        console.log({refs});
        return refs;
      }
    }, Promise.resolve(refsPre));

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
    return new Whit(this.provider, this.build, refsPost);
  }

  static async init(settings: WhitSettings): Promise<Whit> {
    let provider = await Whit.getProvider(settings.provider);
    let build = (await Promise.all(asArray(settings.build).map(Whit.loadBuild))).reduce(Object.assign);
    let whit = new Whit(provider, build, {});

    return await whit.buildContracts(settings.contracts);
  }
}
