module.exports = {
  presets: [
    ['firecloud', {
      '@babel/preset-env': {
        targets: {
          // AWS Lambda Node.js
          node: '6.10'
        }
      }
    }]
  ],

  sourceMaps: true,

  retainLines: true
};
