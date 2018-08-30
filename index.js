const { codeFrameColumns } = require("@babel/code-frame");
const Worker = require("jest-worker").default;

function terser(userOptions) {
  const options = Object.assign({ sourceMap: true }, userOptions);

  return {
    name: "terser",

    transformBundle(code) {
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
