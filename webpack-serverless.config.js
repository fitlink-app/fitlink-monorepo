/* eslint-disable */

/**
 * Nest does not export methods correctly
 * but we need to expose the lambda handler
 * method on build
 */

module.exports = function (options, webpack) {
  return {
    ...options,
    output: {
      ...options.output,

      // This exposes exports correctly including "handler"
      // method in lambda.ts
      libraryTarget: "commonjs"
    }
  };
};
