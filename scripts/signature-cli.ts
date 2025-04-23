#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { createSignature } from '../src/internal/create-signature';

const [, , secret, payload, tsArg] = process.argv;

if (!secret || !payload) {
  console.error('Usage: npm run sign <secret> <payload> [timestamp]');
  process.exit(1);
}

const timestamp = tsArg ? parseInt(tsArg, 10) : undefined;
const signature = createSignature({ secret, payload, timestamp });

console.log(`Signature: ${signature}`);
