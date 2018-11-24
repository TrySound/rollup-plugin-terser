const { codeFrameColumns } = require("@babel/code-frame");
const Worker = require("jest-worker").default;
const { generate } = require("escodegen");
const lave = require("lave");

function terser(userOptions = {}) {
  if (userOptions.sourceMap != null) {
    throw Error("sourceMap option is removed, use sourcemap instead");
  }

  const normalizedOptions = {
    ...userOptions,
    ...{ sourceMap: userOptions.sourcemap !== false }
  };

  for (let key of ["sourcemap", "numWorkers"]) {
    if (normalizedOptions.hasOwnProperty(key)) {
      delete normalizedOptions[key];
    }
  }

  const serializedOptions = lave(
    normalizedOptions,
    { generate, format: "expression" }
  );

  let numOfBundles = 0;

  return {
    name: "terser",

    renderStart() {
      if (!this.worker) {
        this.worker = new Worker(require.resolve("./transform.js"), {
          numWorkers: userOptions.numWorkers
        });
      }
      numOfBundles++;
    },

    renderChunk(code) {
      return this.worker.transform(code, serializedOptions).catch(error => {
        const { message, line, col: column } = error;
        console.error(
          codeFrameColumns(code, { start: { line, column } }, { message })
        );
        throw error;
      });
    },

    generateBundle() {
      numOfBundles--;
      // we only want to end worker on the last bundle
      if (numOfBundles == 0) {
        this.worker.end();
      }
    },

    renderError() {
      numOfBundles--;
      // we only want to end worker on the last bundle
      if (numOfBundles == 0) {
        this.worker.end();
      }
    }
  };
}

exports.terser = terser;
