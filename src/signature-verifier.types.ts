
interface SignatureVerifierConfig {
  signatureVersion?: string;
  timestampToleranceInSeconds?: number;
}

type SignatureVerificationResult = {
  isValid: boolean;
  error?: Error;
}
