# go1-webhook-signature-verifer-js

You can use this library to verify the signature passed in the header to your webhook target endpoint. For more information [please see this guide](https://developers.go1.com/docs/developer-tools/webhooks/security/#Signatures).

## Install

    $ npm i go1-webhook-signature-verifier-js

## Usage

If using a NodeJS framework like ExpressJS and having the req object in scope:

```js
let signature = req.header('go1-signature');
let payload = req.body; // can be a string OR the object already parsed by the express json middlware
let secret = process.env.SHARED_SECRET;

verifySignature(signature, payload, secret); // throws an exception if anything is invalid.

// Signature valid
```

Or if you prefer not to rely on thrown exceptions you can also get a result back like so:


```js

const signatureVerificationResult: SignatureVerificationResult = isSignatureVerified(signature, payload, secret); // { isValid: true, error: null }

const signatureVerificationResult: SignatureVerificationResult = isSignatureVerified(signature, payload, badSecret); // { isValid: false, error: InvalidWebhookSignature('Invalid signature') }

// Signature valid
```
