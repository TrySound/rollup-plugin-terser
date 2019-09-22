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

## Why named export?

1. Module is a namespace. Default export often leads to function/component per file dogma and makes code less maintainable.
2. Interop with commonjs is broken in many cases. A ways to fight them are known. 
3. Show me any good language with default exports. It's historical javascriptism.


## Options

> ⚠️ **Caveat:** any function used in options object cannot rely on its surrounding scope, since it is executed in an isolated context.

```js
terser(options);
```

[Terser API options](https://github.com/fabiosantoscode/terser#minify-options)

`options`

`options.sourcemap: boolean`

Generates source maps and passes them to rollup. Defaults to `true`.

`options.numWorkers: number`

Amount of workers to spawn. Defaults to the number of CPUs minus 1.


`options.include: Array<string | RegExp> | string | RegExp`

`options.exclude: Array<string | RegExp> | string | RegExp`

Specifically include/exclude chunk files names (minimatch pattern, or array of minimatch patterns), By default all chunk files will be minify.

## Examples

### Include/Exclude

If you'd like that only some of the files will be minify, then you can filter by `include` and `exclude` to do this like so:

```js
// rollup.config.js
import { terser } from "rollup-plugin-terser";

export default {
  input: "index.js",
  output: [
    { file: 'lib.js', format: 'cjs' },
    { file: 'lib.min.js', format: 'cjs' },
    { file: 'lib.esm.js', format: 'es' },
    { dir: '.', entryFileNames: 'lib-[format].js', format: 'iife'  }
  ],
  plugins: [
    terser({
      include: [/^.+\.min\.js$/, '*esm*'], 
      exclude: [ 'some*' ]
    })
  ]
};
```

### Comments

Preserve licensing comments:

```js
terser({
  output: {
    comments: 'some'
  }
})
```

Preserve all comments:

```js
terser({
  output: {
    comments: 'all'
  }
})
```

Preserve specific type of comments:

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
})
```

See [Terser API output options]( https://terser.org/docs/api-reference#output-options) documentation for further reference.

If you'd like to place your comments at top of the bundle use Rollup [`output.banner`](https://rollupjs.org/guide/en/#outputbanneroutputfooter) option.

# License

MIT © [Bogdan Chadkin](mailto:trysound@yandex.ru)
