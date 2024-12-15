import { exec as defaultExec } from 'child_process';
import { promisify } from 'util';

export const exec = promisify(defaultExec);
