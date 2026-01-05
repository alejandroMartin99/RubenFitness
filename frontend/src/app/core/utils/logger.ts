/**
 * Logger utility - Only logs in development mode
 */

import { environment } from '../../../environments/environment';

export const logger = {
  log: (...args: any[]) => {
    if (!environment.production) console.log(...args);
  },
  error: (...args: any[]) => {
    if (!environment.production) console.error(...args);
  },
  warn: (...args: any[]) => {
    if (!environment.production) console.warn(...args);
  }
};

