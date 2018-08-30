const { codeFrameColumns } = require("@babel/code-frame");
const Worker = require("jest-worker").default;

function terser(userOptions = {}) {
  if (userOptions.sourceMap != null) {
    throw Error("sourceMap option is removed, use sourcemap instead");
  }
   const options = Object.assign({}, userOptions, {
    sourceMap: userOptions.sourcemap !== false
  });

  return {
    name: "terser",

    renderChunk(code) {
      const worker = new Worker(require.resolve("./transform.js"));

      return worker
        .transform(code, options)
        .then(result => {
          worker.end();
          return result;
        })
        .catch(error => {
          worker.end();
          const { message, line, col: column } = error;
          console.error(
            codeFrameColumns(code, { start: { line, column } }, { message })
          );
          throw error;
        });
    }
  };
}

exports.terser = terser;
