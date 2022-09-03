import { URL } from 'node:url';

const config = {
  /**
   * Default prefix
   */
  PREFIX: "pls ",

  /**
   * Static files for CSS or other assets
   */
  files: {
    LOGS_CSS: new URL("../assets/dark-logs.css", import.meta.url).toString(),
  },
} as const;

export default config;
