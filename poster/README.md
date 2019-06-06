
## The Open Oracle Poster

The poster is a simple application to pull prices from a set of source feeds and post them to the blockchain. The posters main job is to make sure that the requested source data is posted to the Ethereum blockchain, and thus is concerned about nonces, gas prices, etc.

## Installation

The DelFi poster can be run as a standalone process or as a module for configuration. To install as a global process:

```
yarn global add open-oracle-poster
```

Or, if you plan on customizing the poster, you can install in a project:

```
yarn add open-oracle-poster
```

## Running

To run as a standalone:

```
open-oracle-poster --poster-key=0x...
```

Otherwise, you can include the DelFi poster in an app for configuration:

```typescript
import poster from 'delfi-poster';

poster.configure(...);
poster.run();
```
