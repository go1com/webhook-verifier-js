import * as crypto from 'crypto';

interface SignatureOptions {
  secret: string;
  payload: string;
  timestamp?: number;
  version?: string;
}

/**
 * Creates a signature string to simulate a valid webhook signature.
 *
 * @param secret - The webhook secret used to generate the HMAC
 * @param rawBody - The raw stringified JSON body
 * @param timestamp - Optional timestamp, defaults to current time in seconds
 * @returns The formatted signature string: `t=<timestamp>,s=<hex>`
 */
export function createSignature({
  secret,
  payload,
  timestamp = Math.floor(Date.now() / 1000),
  version = 'v1',
}: SignatureOptions): string {
  const baseString = `${timestamp}.${payload}`;
  const hash = crypto.createHmac('sha256', secret).update(baseString, 'utf-8').digest('hex');
  return `t=${timestamp},${version}=${hash}`;
}
