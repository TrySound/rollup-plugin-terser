const { codeFrameColumns } = require("@babel/code-frame");
const { minify } = require("terser");

function terser(userOptions) {
  const options = Object.assign({ sourceMap: true }, userOptions);

  return {
    name: "terser",

    transformBundle(code) {
      const result = minify(code, options);
      if (result.error) {
        const { message, line, col: column } = result.error;
        console.error(
          codeFrameColumns(code, { start: { line, column } }, { message })
        );
        throw result.error;
      }
      return result;
    }
  };
}

exports.terser = terser;
