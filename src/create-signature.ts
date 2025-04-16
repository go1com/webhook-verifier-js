import * as crypto from 'crypto';

/**
 * Creates a signature string to simulate a valid webhook signature.
 *
 * @param secret - The webhook secret used to generate the HMAC
 * @param rawBody - The raw stringified JSON body
 * @param timestamp - Optional timestamp, defaults to current time in seconds
 * @returns The formatted signature string: `t=<timestamp>,s=<hex>`
 */
export function createSignature(secret: string, rawBody: string, timestamp: number = Math.floor(Date.now() / 1000)): string {
  const baseString = `${timestamp}.${rawBody}`;
  const signature = crypto.createHmac('sha256', secret).update(baseString).digest('hex');
  return `t=${timestamp},s=${signature}`;
}
