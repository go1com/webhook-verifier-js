import * as crypto from 'crypto';

/**
 * Creates a signature string to simulate a valid webhook signature.
 *
 * @param secret - The webhook secret used to generate the HMAC
 * @param rawBody - The raw stringified JSON body
 * @param timestamp - Optional timestamp, defaults to current time in seconds
 * @returns The formatted signature string: `t=<timestamp>,s=<hex>`
 */
export function createSignature(
  secret: string,
  rawBody: string,
  timestamp: number = Math.floor(Date.now() / 1000),
  version: string = 'v1'
): string {
  const baseString = `${timestamp}.${rawBody}`;
  const hash = crypto.createHmac('sha256', secret).update(baseString, 'utf-8').digest('hex');
  return `t=${timestamp},${version}=${hash}`;
}

