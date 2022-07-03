import { rm } from 'node:fs/promises';
import { URL } from 'node:url';

const distDir = new URL('../dist/', import.meta.url);

const config = { recursive: true, force: true };
await rm(distDir, config);