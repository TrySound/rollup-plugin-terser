# rollup-plugin-terser [![Travis Build Status][travis-img]][travis]

[travis-img]: https://travis-ci.org/TrySound/rollup-plugin-terser.svg
[travis]: https://travis-ci.org/TrySound/rollup-plugin-terser

[Rollup](https://github.com/rollup/rollup) plugin to minify generated es bundle. Uses [terser](https://github.com/fabiosantoscode/terser) under the hood.

## Install

```sh
yarn add rollup-plugin-terser --dev
```

*Note: this package requires rollup@0.66 and higher (including rollup@1.0.0)*

## Usage

```js
import { rollup } from "rollup";
import { terser } from "rollup-plugin-terser";

rollup({
  input: "main.js",
  plugins: [terser()]
});
```

## Options

> ⚠️ **Caveat:** any function used in options object cannot rely on its surrounding scope, since it is executed in an isolated context.

```js
terser(options);
```

`options` - [terser API options](https://github.com/fabiosantoscode/terser#minify-options)

`options.sourcemap: boolean`

Generates source maps and passes them to rollup. Defaults to `true`.

`options.numWorkers: number`

Amount of workers to spawn. Defaults to the number of CPUs minus 1.

## Examples

### Comments

If you'd like to preserve comments (for licensing for example), then you can specify a function to do this like so:

```js
terser({
  output: {
    comments: function(node, comment) {
      var text = comment.value;
      var type = comment.type;
      if (type == "comment2") {
        // multiline comment
        return /@preserve|@license|@cc_on/i.test(text);
      }
    }
  }
});
```

Alternatively, you can also choose to keep all comments (e.g. if a licensing header has already been prepended by a previous rollup plugin):

```js
terser({
  output: {
    comments: "all"
  }
});
```

See [Terser documentation](https://github.com/fabiosantoscode/terser#terser) for further reference.

# License

MIT © [Bogdan Chadkin](mailto:trysound@yandex.ru)
