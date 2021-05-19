const path = require('path')

module.exports = {
  distDir: '../../dist/apps/admin',
  webpack: function( config, { defaultLoaders } ){
    // config.module.rules.forEach((rule) => {
    //   const isTsRule = rule.test && rule.test.toString().includes('tsx|ts');

    //   /**
    //    * Includes the sdk for API
    //    */
    //   if (isTsRule && rule.use && rule.use.loader === 'next-babel-loader') {
    //     const sdk = path.join(path.dirname(__dirname), 'sdk', 'api')
    //     console.info(`Include: ${sdk}`)
    //     rule.include = [ sdk, ...rule.include ];
    //     console.log(rule.include)
    //   }
    // });

    /**
     * Includes the sdk for API
     */
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: [ path.join(path.dirname(__dirname), 'sdk', 'api') ],
      use: [ defaultLoaders.babel ],
    })
    return config
  }
}
