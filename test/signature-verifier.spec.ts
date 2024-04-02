import { verifySignature, configure as configureSignatureVerification } from '../src';
import { DEFAULT_CONFIG } from '../src/config';
import { faker } from '@faker-js/faker';
import { createHmac } from 'crypto';
import { InvalidWebhookSignatureTimestamp, InvalidWebhookSignatureVersion } from '../src/signature-verifier.exceptions';

let secret: string;
let payload: string;
let timestamp: number;

const createSignature = (timestamp: number, payload: string, secret: string, version: string = 'v1') =>
  `t=${timestamp},${version}=${createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf-8')
    .digest('hex')}`;

beforeEach(() => {
  secret = faker.internet.password();
  payload = JSON.stringify({id: faker.string.uuid(), 'event_type': 'enrollment.complete'});
  timestamp = Math.floor(Date.now() / 1000);
});

describe('SignatureVerifier', () => {
  it('verifies a signature successfully', () => {
    expect(verifySignature(createSignature(timestamp, payload, secret), payload, secret)).toBeUndefined();
  });

  it('finds invalid timestamp outside default tolerance', () => {
    expect(() => {verifySignature(createSignature(timestamp - DEFAULT_CONFIG.timestampToleranceInSeconds - 1, payload, secret), payload, secret)}).toThrow(InvalidWebhookSignatureTimestamp);
  });

  it('finds invalid timestamp version', () => {
    expect(() => {verifySignature(createSignature(timestamp, payload, secret, `v${faker.number.bigInt()}`), payload, secret)}).toThrow(InvalidWebhookSignatureVersion);
  });
});

describe('SignatureVerifier with custom configuration', () => {
  it('verifies a signature successfully', () => {
    configureSignatureVerification({timestampToleranceInSeconds: 10});
    expect(verifySignature(createSignature(timestamp, payload, secret), payload, secret)).toBeUndefined();
  });

  it('finds invalid timestamp outside configured tolerance', () => {
    configureSignatureVerification({timestampToleranceInSeconds: 10});
    expect(() => {verifySignature(createSignature(timestamp - 11, payload, secret), payload, secret)}).toThrow(InvalidWebhookSignatureTimestamp);
  });

  it('finds invalid timestamp version', () => {
    configureSignatureVerification({signatureVersion: `v${faker.number.bigInt()}`});
    expect(() => {verifySignature(createSignature(timestamp, payload, secret, `v1`), payload, secret)}).toThrow(InvalidWebhookSignatureVersion);
  });
});
