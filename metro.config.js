// Disable CSS transformation to avoid async PostCSS plugin errors
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Treat .css files as assets, not source, so Metro won't run its CSS transformer
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'css');
config.resolver.assetExts = config.resolver.assetExts.concat(['css']);

module.exports = config;
