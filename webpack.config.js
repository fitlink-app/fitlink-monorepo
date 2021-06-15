/* eslint-disable */
const path = require('path')

/**
 * Currently not in use, commented out for reference
 */

module.exports = function (config) {
  // const use = config.module.rules[0].use
  // /**
  //    * Include external codebases from mono-repo
  //    */
  // // config.module.rules.push({
  // //   test: /\.(ts)$/,
  // //   include: [
  // //     // Common helpers / types / libs
  // //     path.join(__dirname, 'apps', 'common')
  // //   ],
  // //   use
  // // })

  // config.module.rules[0].include = [
  //   path.join(__dirname, 'apps', 'api'),
  //   path.join(__dirname, 'apps', 'common')
  // ]

  return config
};
