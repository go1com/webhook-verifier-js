import { verifySignature } from '../src';
import { createSignature } from '../src/create-signature';

describe('createSignature()', () => {
  it('should generate a valid signature string', () => {
    const secret = 'test-secret';
    const payload = JSON.stringify({ message: 'hello' });
    const timestamp = 1713261120;

    const signature = createSignature({ secret, payload, timestamp });

    expect(signature).toMatch(/^t=\d+,v1=[a-f0-9]{64}$/);
    expect(signature).toContain(`t=${timestamp}`);
  });

  it('should produce a signature that verifySignature() accepts', () => {
    const secret = 'test-secret';
    const payload = JSON.stringify({ message: 'verified' });
    const timestamp = Math.floor(Date.now() / 1000);
    const version = 'v1';

    const signature = createSignature({ secret, payload, timestamp, version });

    expect(() => verifySignature(signature, payload, secret)).not.toThrow();
  });
});
