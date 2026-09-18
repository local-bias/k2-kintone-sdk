import { DEFAULT_PORT } from './constants.js';

export const getDefaultK2Config = (): K2.Config => ({
  version: 1,
  server: { port: DEFAULT_PORT },
});
