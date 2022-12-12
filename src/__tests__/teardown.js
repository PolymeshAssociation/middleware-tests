/* eslint-disable @typescript-eslint/no-var-requires */
const childProcess = require('child_process');
const { setup } = require('../environment');

module.exports = async function () {
  if (setup.disableLocalSetup) {
    console.log('skipping polymesh-local teardown since disable flag was truthy');
    return;
  }

  console.log('shutting down polymesh-local');
  childProcess.execSync('yarn run polymesh-local stop --clean');
};
