import { createSignature } from '../src/create-signature';

describe('createSignature()', () => {
  it('should generate a valid signature string', () => {
    const secret = 'test-secret';
    const payload = JSON.stringify({ message: 'hello' });
    const timestamp = 1713261120;

    const signature = createSignature(secret, payload, timestamp);

    expect(signature).toMatch(/^t=\d+,s=[a-f0-9]{64}$/);
    expect(signature).toContain(`t=${timestamp}`);
  });
});
