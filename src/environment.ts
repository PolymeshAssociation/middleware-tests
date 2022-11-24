import * as dotenv from 'dotenv';

dotenv.config();

const restApi = process.env.REST_API_URL || 'http://localhost:3004';

export const urls = {
  restApi,
};
