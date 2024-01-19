# Boilerplate Create

A CLI for starting projects.

```
npx --yes @tadashi/boilerplate-create
```

or

```
npm i -g @tadashi/boilerplate-create
boilerplate-create
```

...and follow the prompts.

## API

```js
import {create} from '@tadashi/boilerplate-create'

await create('my-app', {
  template: 'rest', // or 'gql' or 'ws' or 'svelte'
  features: false,
})
```

## License

MIT © [Thiago Lagden](https://github.com/lagden)
