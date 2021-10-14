const path = require('path')
const webpack = require('webpack')

module.exports = {
  // Disabling this line since it breaks Vercel deployments
  // distDir: '../../dist/apps/admin',
  webpack: function( config, { defaultLoaders } ){
    /**
     * Include external codebases from mono-repo
     */
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: [

        // Api sdk
        path.join(path.dirname(__dirname), 'api-sdk'),

        // Api
        path.join(path.dirname(__dirname), 'api'),

        // Common helpers / types / libs
        path.join(path.dirname(__dirname), 'common')
      ],
      use: [ defaultLoaders.babel ]
    })

    config.resolve.alias.typeorm = path.resolve(__dirname, "../../node_modules/typeorm/typeorm-model-shim")
    config.resolve.alias['@nestjs/swagger'] = path.resolve(__dirname, "src/shims/swagger.ts")

    return config
  }
}

