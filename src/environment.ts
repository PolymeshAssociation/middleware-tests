import * as dotenv from 'dotenv';

import { PolymeshLocalSettings } from '~/rest/interfaces';

import { getLocalMnemonics } from './util';

dotenv.config();

const restApi = process.env.REST_API_URL || 'http://localhost:3004';
const disableLocalSetup = process.env.DISABLE_LOCAL_SETUP || false;

export const urls = {
  restApi,
};

export const setup = {
  disableLocalSetup,
};

export const getPolymeshLocalSettings = async (): Promise<PolymeshLocalSettings> => {
  const mnemonics = await getLocalMnemonics();

  return {
    restSigners: Object.keys(mnemonics).join(','),
    restMnemonics: Object.values(mnemonics).join(','),
  };
};
