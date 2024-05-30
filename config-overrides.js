const path = require('path');
const { override, adjustStyleLoaders } = require('customize-cra');
const fs = require('fs');

const setConstantFilenames = () => (config) => {
  if (config.mode === 'production') {
    // Disable filename hashing
    config.output.filename = 'static/js/[name].js';
    config.output.chunkFilename = 'static/js/[name].chunk.js';

    // Disable hashing for CSS files
    adjustStyleLoaders(({ use: [ , css, , postcss, sass] }) => {
      if (css.options.modules) {
        css.options.modules.localIdentName = '[name]__[local]';
      }
    })(config);
  }
  return config;
};

// Move main.js to app folder after build
const moveMainJsToApp = () => (config) => {
  if (config.mode === 'production') {
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('MoveMainJsPlugin', (compilation) => {
          const outputPath = compilation.outputOptions.path;
          const mainJsPath = path.resolve(outputPath, 'static/js/main.js');
          const appDir = path.resolve(__dirname, 'app');
          
          if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir);
          }

          if (fs.existsSync(mainJsPath)) {
            fs.renameSync(mainJsPath, path.join(appDir, 'main.js'));
          }
        });
      }
    });
  }
  return config;
};

module.exports = override(
  setConstantFilenames(),
  moveMainJsToApp()
);
