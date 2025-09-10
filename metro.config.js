// metro.config.js
console.log("🔧 custom metro.config.js loaded");

const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const nodeLibs = require('node-libs-react-native');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  config.resolver.extraNodeModules = {
    // all of the standard React Native–compatible Node shims
    ...config.resolver.extraNodeModules,
    ...nodeLibs,
    // override ‘net’ and ‘tls’ with empty stubs
    net: path.resolve(__dirname, 'stubs', 'net.js'),
    tls: path.resolve(__dirname, 'stubs', 'tls.js'),
  };

  return config;
})();
