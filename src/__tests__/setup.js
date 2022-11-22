/* eslint-disable @typescript-eslint/no-var-requires */
const childProcess = require('child_process');
const { setup, getPolymeshLocalSettings } = require('../environment');

const chainVersion = 'latest';

module.exports = async function () {
  console.log('\n');
  if (setup.disableLocalSetup) {
    console.log('skipping polymesh-local setup since disable flag was truthy');
    return;
  }

  const { restSigners, restMnemonics } = await getPolymeshLocalSettings();

  console.log('starting polymesh-local with REST API signers:', restSigners);

  childProcess.execSync(
    `yarn run polymesh-local start -v ${chainVersion} -c --restSigners='${restSigners}' --restMnemonics='${restMnemonics}'`
  );
};
