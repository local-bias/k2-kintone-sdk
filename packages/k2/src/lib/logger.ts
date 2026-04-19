const PKG_NAME = '@konomi-app/k2';

export function createLogger(prefix = PKG_NAME) {
  return {
    log: (...args: unknown[]) => console.log(`[${prefix}]`, ...args),
    info: (...args: unknown[]) => console.info(`[${prefix}]`, ...args),
    warn: (...args: unknown[]) => console.warn(`[${prefix}]`, ...args),
    error: (...args: unknown[]) => console.error(`[${prefix}]`, ...args),
  };
}

export default createLogger();
