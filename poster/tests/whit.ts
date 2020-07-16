import Ganache from 'ganache-core';
import { ethers } from 'ethers';
import { promises as fs } from 'fs';

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

type AddressLike = Address | {
  address: string
}

interface ContractReq {
  deploy: [string, any[]] | ((refs: Refs) => AddressLike)
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

  private constructor(provider: ethers.providers.Provider, build: object) {
    this.provider = provider;
    this.build = build;
    this.refs = {};
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
    return <Build>json['contracts'];
  }

  static async init(settings: WhitSettings): Promise<Whit> {
    let provider = await Whit.getProvider(settings.provider);
    let build = (await Promise.all(asArray(settings.build).map(Whit.loadBuild))).reduce(Object.assign);
    let whit = new Whit(provider, build);

    // TODO: Set-up contracts

    return whit;
  }
}