/* eslint-disable @typescript-eslint/no-var-requires */
const childProcess = require('child_process');
const { setup, polymeshLocalSettings } = require('../environment');

const chainVersion = '5.0.3';

module.exports = async function () {
  if (setup.disableLocalSetup) {
    console.log('\nskipping polymesh-local setup since disable flag was truthy');
    return;
  }

  const { restSigners, restMnemonics } = polymeshLocalSettings;

  console.log('\nstarting polymesh-local');

  childProcess.execSync(
    `yarn run polymesh-local start -v ${chainVersion} -c --restSigners='${restSigners}' --restMnemonics='${restMnemonics}'`
  );
};
