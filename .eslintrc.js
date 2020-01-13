module.exports = {
  root: true,

  extends: [
    'firecloud/node',
    'firecloud/configs/browser'
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
