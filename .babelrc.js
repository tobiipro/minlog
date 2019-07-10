module.exports = {
  presets: [
    ['firecloud', {
      '@babel/preset-env': {
        targets: {
          browsers: [
            'last 2 Chrome versions'
          ],
          node: '10'
        }
      }
    }]
  ],

  sourceMaps: true,

  retainLines: true
};
