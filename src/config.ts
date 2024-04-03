import { SignatureVerifierConfig } from './signature-verifier.types';

export const DEFAULT_CONFIG: SignatureVerifierConfig = {
  signatureVersion: 'v1',
  timestampToleranceInSeconds: 60,
};
