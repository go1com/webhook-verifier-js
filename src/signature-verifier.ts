import { createHmac } from 'node:crypto';
import { DEFAULT_CONFIG } from './config';
import { InvalidWebhookSignature, InvalidWebhookSignatureTimestamp, InvalidWebhookSignatureVersion } from './signature-verifier.exceptions';

let config: SignatureVerifierConfig = { ...DEFAULT_CONFIG };

export function configure(options: Partial<SignatureVerifierConfig>): void {
    config = { ...config, ...options };
}

export function verifySignature<T>(rawSignature: string, rawPayload: T, secret: string): void {
  const rawSignatureParts = rawSignature.split(',');
  const timestamp = parseInt(rawSignatureParts[0].split('=')[1]);
  const payload = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);

  validateTimestamp(timestamp);
  validateSignatureVersion(rawSignatureParts[1].split('=')[0]);
  
  const hmac = createHmac('sha256', secret);
  const generatedSignature = hmac.update(`${timestamp}.${payload}`, 'utf-8').digest('hex');

  if (rawSignatureParts[1].split('=')[1] !== generatedSignature) {
    console.log(generatedSignature);
    console.log(rawSignatureParts[1].split('=')[1]);
    throw new InvalidWebhookSignature('Invalid signature');
  }
}

function validateTimestamp(timestamp: number) {
  if (Math.floor(Date.now() / 1000) - timestamp > config.timestampToleranceInSeconds) {
    throw new InvalidWebhookSignatureTimestamp('Signature timestamp is out of tolerances. Possible replay attack');
  }
}

function validateSignatureVersion(signatureVersion: string) {
  if (signatureVersion != config.signatureVersion) {
    throw new InvalidWebhookSignatureVersion('Invalid signature version');
  }
}

