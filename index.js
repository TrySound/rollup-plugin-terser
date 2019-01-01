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
    if (Object.prototype.hasOwnProperty.call(normalizedOptions, key)) {
      delete normalizedOptions[key];
    }
  }

  const serializedOptions = lave(
    normalizedOptions,
    { generate, format: "expression" }
  );

  return {
    name: "terser",

    renderStart() {
      this.worker = new Worker(require.resolve("./transform.js"), {
        numWorkers: userOptions.numWorkers
      });
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
      this.worker.end();
    },

    renderError() {
      this.worker.end();
    }
  };
}

exports.terser = terser;
