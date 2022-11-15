import * as dotenv from 'dotenv';

import { mnemonics } from './consts';

dotenv.config();

const restApi = process.env.REST_API_URL || 'http://localhost:3004';
const disableLocalSetup = process.env.DISABLE_LOCAL_SETUP || false;

export const urls = {
  restApi,
};

export const setup = {
  disableLocalSetup,
};

export const polymeshLocalSettings = {
  restSigners: Object.keys(mnemonics).join(','),
  restMnemonics: Object.values(mnemonics).join(','),
};
