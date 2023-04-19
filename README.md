# Boilerplate Create

A CLI for starting projects.

```
npx @tadashi/boilerplate-create
```

...and follow the prompts.


## API

```js
import {create} from 'create-svelte'

await create('my-app', {
  template: 'rest', // or 'gql' or 'ws' or 'svelte'
  features: false,
})
```


## License

MIT © [Thiago Lagden](https://github.com/lagden)
