const path = require('path')

module.exports = {
  distDir: '../../dist/apps/admin',
  webpack: function( config, { defaultLoaders } ){
    /**
     * Includes the sdk for API
     */
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: [ path.join(path.dirname(__dirname), 'api-sdk') ],
      use: [ defaultLoaders.babel ],
    })
    return config
  }
}
