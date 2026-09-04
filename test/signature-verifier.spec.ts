import {
  verifySignature,
  isSignatureVerified,
  configure as configureSignatureVerification,
} from '../src';
import { faker } from '@faker-js/faker';
import {
  InvalidWebhookSignature,
  InvalidWebhookSignatureTimestamp,
  InvalidWebhookSignatureVersion,
} from '../src/signature-verifier.exceptions';
import { createSignature } from '../src/internal/create-signature';

let secret: string;
let payload: string;
let timestamp: number;

beforeEach(() => {
  secret = faker.internet.password();
  payload = JSON.stringify({ id: faker.string.uuid(), event_type: 'enrollment.complete' });
  timestamp = Math.floor(Date.now() / 1000);
  configureSignatureVerification(); // resets defaults
});

describe('SignatureVerifier', () => {
  it('verifies a signature successfully', () => {
    expect(verifySignature(createSignature({ secret, payload, timestamp }), payload, secret)).toBeUndefined();
  });

  it('verifies a signature successfully when the timestamp is in milliseconds', () => {
    const timestampInMilliseconds = Date.now();

    expect(
      verifySignature(
        createSignature({ secret, payload, timestamp: timestampInMilliseconds }),
        payload,
        secret
      )
    ).toBeUndefined();
  });

  it('finds invalid signature', () => {
    expect(() => {
      verifySignature(createSignature({ secret, payload, timestamp }), payload, faker.internet.password());
    }).toThrow(InvalidWebhookSignature);
  });

  it('finds invalid timestamp outside default tolerance', () => {
    expect(() => {
      verifySignature(createSignature({ secret, payload, timestamp: timestamp - 61 }), payload, secret);
    }).toThrow(InvalidWebhookSignatureTimestamp);
  });

  it('finds invalid millisecond timestamp outside default tolerance', () => {
    expect(() => {
      verifySignature(
        createSignature({ secret, payload, timestamp: Date.now() - 61000 }),
        payload,
        secret
      );
    }).toThrow(InvalidWebhookSignatureTimestamp);
  });

  it('finds invalid timestamp version', () => {
    expect(() => {
      verifySignature(
        createSignature({ secret, payload, timestamp, version: `v${faker.number.bigInt()}` }),
        payload,
        secret
      );
    }).toThrow(InvalidWebhookSignatureVersion);
  });
});

describe('SignatureVerifier with custom configuration', () => {
  it('verifies a signature successfully', () => {
    configureSignatureVerification({ timestampToleranceInSeconds: 10 });
    expect(verifySignature(createSignature({ secret, payload, timestamp }), payload, secret)).toBeUndefined();
  });

  it('finds invalid timestamp outside configured tolerance', () => {
    configureSignatureVerification({ timestampToleranceInSeconds: 10 });
    expect(() => {
      verifySignature(createSignature({ secret, payload, timestamp: timestamp - 11 }), payload, secret);
    }).toThrow(InvalidWebhookSignatureTimestamp);
  });

  it('finds invalid timestamp version', () => {
    configureSignatureVerification({ signatureVersion: `v${faker.number.bigInt()}` });
    expect(() => {
      verifySignature(createSignature({ secret, payload, timestamp, version: `v1` }), payload, secret);
    }).toThrow(InvalidWebhookSignatureVersion);
  });
});

describe('isSignatureVerified', () => {
  it('verifies a signature successfully', () => {
    expect(isSignatureVerified(createSignature({ secret, payload, timestamp }), payload, secret)).toEqual({
      isValid: true,
    });
  });

  it('finds invalid signature', () => {
    expect(
      isSignatureVerified(createSignature({ secret, payload, timestamp }), payload, faker.internet.password())
    ).toEqual({
      isValid: false,
      error: new InvalidWebhookSignature('Invalid signature'),
    });
  });

  it('finds invalid timestamp outside default tolerance', () => {
    expect(
      isSignatureVerified(createSignature({ secret, payload, timestamp: timestamp - 61 }), payload, secret)
    ).toEqual({
      isValid: false,
      error: new InvalidWebhookSignatureTimestamp(
        'Signature timestamp is outside the range of tolerance. Possible replay attack'
      ),
    });
  });

  it('finds invalid timestamp version', () => {
    expect(
      isSignatureVerified(
        createSignature({ secret, payload, timestamp, version: `v${faker.number.bigInt()}` }),
        payload,
        secret
      )
    ).toEqual({
      isValid: false,
      error: new InvalidWebhookSignatureVersion('Invalid signature version'),
    });
  });
});
