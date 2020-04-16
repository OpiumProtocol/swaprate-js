# SwapRate JS SDK

This JavaScript implements HTTP and Socket.io API of https://swaprate.finance

## Documentation

API Reference - https://opiumprotocol.github.io/swaprate-js/

HTTP and Socket.io API Specification - https://opiumprotocol.github.io/swaprate-api/


## Installation

```
npm i @opiumteam/swaprate-js
```

## Examples

### Get products list

```
import { Api } from '@opiumteam/swaprate-js'

Api
  .getProducts()
  .then(products => console.log(products))
```

## Development

Clone project and install dev dependencies

```
npm i
```

Run TS build, linter and docs

```
npm run build
npm run lint
npm run docs
```

Submit pull requests