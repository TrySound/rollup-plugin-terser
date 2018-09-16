const { codeFrameColumns } = require("@babel/code-frame");
const Worker = require("jest-worker").default;
const serialize = require("serialize-javascript");

function terser(userOptions = {}) {
  if (userOptions.sourceMap != null) {
    throw Error("sourceMap option is removed, use sourcemap instead");
  }

  const minifierOptions = serialize(
    Object.assign({}, userOptions, {
      sourceMap: userOptions.sourcemap !== false,
      sourcemap: undefined,
      numWorkers: undefined
    })
  );

  return {
    name: "terser",

    renderStart() {
      this.worker = new Worker(require.resolve("./transform.js"), {
        numWorkers: userOptions.numWorkers
      });
    },

    renderChunk(code) {
      return this.worker.transform(code, minifierOptions).catch(error => {
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
