import registerPromiseWorker from "promise-worker/register";
import babelPresetBabili from "babel-preset-babili";
import prettier from "prettier";
import generate from "babel-generator";

importScripts("//unpkg.com/babel-standalone@6/babel.min.js");

registerPromiseWorker(function babelTransform({ source, options = {} }) {
  let transitions = [];

  if (Array.isArray(options.presets)) {
    for (const [i, preset] of options.presets.entries()) {
      if (preset === "babili") {
        options.presets[i] = babelPresetBabili;
      }
    }
  }

  Object.assign(options, {
    wrapPluginVisitorMethod(pluginAlias, visitorType, callback) {
      return function(...args) {
        const code = JSON.stringify(getProgramParent(args[0]).node);

        if (transitions[transitions.length - 1] !== code) {
          transitions.push(code);
        }
        callback.call(this, ...args);
      };
    }
  });

  const output = Babel.transform(source, options).code;

  // prettier code
  let _transitions = [];
  for (let i = 0; i < transitions.length; i++) {
    const code = prettier.format(generate(JSON.parse(transitions[i])).code);
    if (i === 0 || transitions[i - 1] !== code) {
      _transitions;
    }
  }

  transitions.push(output);

  return { transitions };
});

function getProgramParent(path) {
  let parent = path;
  do {
    if (parent.isProgram()) return parent;
  } while ((parent = parent.parentPath));
}
