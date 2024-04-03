import { verifySignature, isSignatureVerified, configure as configureSignatureVerification } from '../src';
import { faker } from '@faker-js/faker';
import { createHmac } from 'crypto';
import { InvalidWebhookSignature, InvalidWebhookSignatureTimestamp, InvalidWebhookSignatureVersion } from '../src/signature-verifier.exceptions';

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
  configureSignatureVerification(); // resets defaults
});

describe('SignatureVerifier', () => {
  it('verifies a signature successfully', () => {
    expect(verifySignature(createSignature(timestamp, payload, secret), payload, secret)).toBeUndefined();
  });

  it('finds invalid signature', () => {
    expect(() => {verifySignature(createSignature(timestamp, payload, secret), payload, faker.internet.password())}).toThrow(InvalidWebhookSignature);
  });

  it('finds invalid timestamp outside default tolerance', () => {
    expect(() => {verifySignature(createSignature(timestamp - 61, payload, secret), payload, secret)}).toThrow(InvalidWebhookSignatureTimestamp);
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

describe('isSignatureVerified', () => {
  it('verifies a signature successfully', () => {
    expect(isSignatureVerified(createSignature(timestamp, payload, secret), payload, secret)).toEqual({isValid: true});
  });

  it('finds invalid signature', () => {
    expect(isSignatureVerified(createSignature(timestamp, payload, secret), payload, faker.internet.password())).toEqual({
        isValid: false, 
        error: new InvalidWebhookSignature('Invalid signature')
      });
  });

  it('finds invalid timestamp outside default tolerance', () => {
    expect(isSignatureVerified(createSignature(timestamp - 61, payload, secret), payload, secret)).toEqual({
        isValid: false, 
        error: new InvalidWebhookSignatureTimestamp('Signature timestamp is outside the range of tolerance. Possible replay attack')
      });
  });

  it('finds invalid timestamp version', () => {
    expect(isSignatureVerified(createSignature(timestamp, payload, secret, `v${faker.number.bigInt()}`), payload, secret)).toEqual({
      isValid: false, 
      error: new InvalidWebhookSignatureVersion('Invalid signature version')
    });
  });
});
