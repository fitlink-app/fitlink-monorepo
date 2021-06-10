const path = require('path')

module.exports = {
  distDir: '../../dist/apps/admin',
  webpack: function( config, { defaultLoaders } ){
    /**
     * Include external codebases from mono-repo
     */
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: [

        // Api sdk
        path.join(path.dirname(__dirname), 'api-sdk'),

        // Common helpers / types / libs
        path.join(path.dirname(__dirname), 'common')
      ],
      use: [ defaultLoaders.babel ],
    })
    return config
  }
}
