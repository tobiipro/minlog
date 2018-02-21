module.exports = {
  presets: [
    ['firecloud', {
      'babel-preset-env': {
        targets: {
          node: '6.10'
        }
      }
    }]
  ],
  sourceMaps: true
};
