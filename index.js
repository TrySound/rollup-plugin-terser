const { codeFrameColumns } = require("@babel/code-frame");
const Worker = require("jest-worker").default;
const serialize = require("serialize-javascript");
const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

function terser(userOptions = {}) {
  if (userOptions.sourceMap != null) {
    throw Error("sourceMap option is removed, use sourcemap instead");
  }
  
  let fileName = '';
  if (userOptions.filename) {
    fileName = userOptions.filename;
    delete userOptions.filename;
  }

  return {
    name: "terser",

    renderChunk(code, chunk, outputOptions) {
      if (!this.worker) {
        this.worker = new Worker(require.resolve("./transform.js"), {
          numWorkers: userOptions.numWorkers
        });
        this.numOfBundles = 0;
      }

      this.numOfBundles++;

      // TODO rewrite with object spread after node6 drop
      const normalizedOptions = Object.assign({}, userOptions, {
        sourceMap: userOptions.sourcemap !== false,
        module: outputOptions.format === "es" || outputOptions.format === "esm"
      });

      for (let key of [ "sourcemap", "numWorkers"] ) {
        if (normalizedOptions.hasOwnProperty(key)) {
          delete normalizedOptions[key];
        }
      }

      const serializedOptions = serialize(normalizedOptions);

      const result = this.worker
        .transform(code, serializedOptions)
        .catch(error => {
          const { message, line, col: column } = error;
          console.error(
            codeFrameColumns(code, { start: { line, column } }, { message })
          );
          throw error;
        });

      const handler = () => {
        this.numOfBundles--;

        if (this.numOfBundles === 0) {
          this.worker.end();
          this.worker = 0;
        }
      };
      
      const writer = async ret => {
        if (fileName && outputOptions.file) {
          await writeFile(fileName, ret.code);
          if (ret.map && outputOptions.sourcemap) {
            await writeFile(fileName.concat(".map"), ret.map);
          }
          return null;
        }
        return ret;
      }

      result.then(handler, handler);

      return result.then(writer);
    }
  };
}

exports.terser = terser;
