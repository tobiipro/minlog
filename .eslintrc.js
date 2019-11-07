module.exports = {
  root: true,

  extends: [
    'firecloud/node',
    'firecloud/configs/browser.js'
  ],

  overrides: [{
    files: [
      '*.ts'
    ],

    extends: [
      'firecloud/configs/typescript'
    ]
  }]
};
