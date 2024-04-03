export interface SignatureVerifierConfig {
  signatureVersion?: string;
  timestampToleranceInSeconds?: number;
}

export type SignatureVerificationResult = {
  isValid: boolean;
  error?: Error;
};
