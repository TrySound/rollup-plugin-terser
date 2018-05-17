const assert = require("assert");
const { rollup } = require("rollup");
const readFile = require("fs").readFileSync;
const { terser } = require("../");

test("minify", async () => {
  const bundle = await rollup({
    input: "test/fixtures/unminified.js",
    plugins: [terser()]
  });
  const result = await bundle.generate({ format: "cjs" });
  expect(Object.keys(result)).toHaveLength(2);
  expect(result.code).toEqual('"use strict";var a=5;a<3&&console.log(4);\n');
  expect(result.map).toBeFalsy();
});

test("minify via terser options", async () => {
  const bundle = await rollup({
    input: "test/fixtures/empty.js",
    plugins: [terser({ output: { comments: "all" } })]
  });
  const result = await bundle.generate({
    banner: "/* package name */",
    format: "cjs"
  });
  expect(Object.keys(result)).toHaveLength(2);
  expect(result.code).toEqual('/* package name */\n"use strict";\n');
  expect(result.map).toBeFalsy();
});

test("minify with sourcemaps", async () => {
  const bundle = await rollup({
    input: "test/fixtures/sourcemap.js",
    plugins: [terser()]
  });
  const result = await bundle.generate({ format: "cjs", sourcemap: true });
  expect(Object.keys(result)).toHaveLength(2);
  expect(result.map).toBeTruthy();
});

test.only("throw error on terser fail", async () => {
  try {
    const bundle = await rollup({
      input: "test/fixtures/failed.js",
      plugins: [
        {
          transformBundle: () => ({ code: "var = 1" })
        },
        terser()
      ]
    });
    await bundle.generate({ format: "es" });
    expect(true).toBeFalsy();
  } catch (error) {
    expect(error.toString()).toMatch(/Name expected/);
  }
});
