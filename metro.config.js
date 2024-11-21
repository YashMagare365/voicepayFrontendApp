// // metro.config.js
// const { getDefaultConfig } = require('metro-config');

// module.exports = (async () => {
//   const defaultConfig = await getDefaultConfig();
//   return {
//     resolver: {
//       assetExts: defaultConfig.resolver.assetExts,
//       sourceExts: defaultConfig.resolver.sourceExts,
//     },
//   };
// })();

const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  return {
    ...config,
    resolver: {
      ...config.resolver,
      sourceExts: [...config.resolver.sourceExts, 'cjs'], // add 'cjs' for compatibility
    },
  };
})();
