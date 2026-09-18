import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** バンドル後は `dist/` に配置されるため、パッケージルートの package.json を参照します */
const { version } = require('../package.json') as { version: string };

export const K2_VERSION: string = version;
