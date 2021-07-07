# `seguro-worker-lib` README

The seguro-worker-lib library.

## Usage

Add as a dependency to a Node.js project:

```bash
yarn add @conet-project/seguro-worker-lib
```

Import from the package:

```ts
import { Person, getGreeting } from '@conet-project/seguro-worker-lib'

const person: Person = { name: 'John' }

console.log(getGreeting(person))
```

## Development

### Install

```bash
yarn
```

### Lint

```bash
yarn lint
```

### Test
```bash
yarn test
```

### Build

```bash
yarn build
```

### Clean

```bash
yarn clean
```
