/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const blacklist = require('metro-config/src/defaults/exclusionList');
const getWorkspaces = require('get-yarn-workspaces');
const path = require('path');
const Resolver = require('metro-resolver');

function getConfig(appDir, options = {}) {
  const workspaces = getWorkspaces(appDir);

  // Add additional Yarn workspace package roots to the module map
  // https://bit.ly/2LHHTP0
  const watchFolders = [
    path.resolve(appDir, '.', 'node_modules'),
    ...workspaces.filter(workspaceDir => !(workspaceDir === appDir)),
  ];

  return {
    watchFolders,
    resolver: {
      blacklistRE: blacklist([
        // Ignore other resolved react-native installations outside of this workspace
        // this prevents a module naming collision when mapped.
        /^((?!mobile).)+[\/\\]node_modules[/\\]react-native[/\\].*/,
      ]),
      extraNodeModules: {
        // Resolve all react-native module imports to the locally-installed version
        'react-native': path.resolve(appDir, 'node_modules', 'react-native'),

        // Resolve additional nohoist modules depended on by other packages
        'react-native-svg': path.resolve(
          appDir,
          'node_modules',
          'react-native-svg',
        ),

        // Resolve core-js imports to the locally installed version
        'core-js': path.resolve(appDir, 'node_modules', 'core-js'),
      },
      // Make sure we use the local copy of react and react-native
      resolveRequest: (context, realModuleName, platform, moduleName) => {
        const clearContext = {...context, resolveRequest: undefined};
        const module =
          moduleName === 'react' || moduleName === 'react-native'
            ? path.join(__dirname, 'node_modules', realModuleName)
            : realModuleName;
        return Resolver.resolve(clearContext, module, platform);
      },
    },
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
  };
}

module.exports = getConfig(__dirname);
