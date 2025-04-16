# @go1/webhook-verifier-js

[![Node.js CI](https://github.com/go1com/webhook-verifier-js/actions/workflows/node.js.yml/badge.svg)](https://github.com/go1com/webhook-verifier-js/actions/workflows/node.js.yml)

You can use this library to verify the signature passed in the header to your webhook target endpoint.

For more information on signatures with Go1 Webhooks 🔗 [please see this guide](https://developers.go1.com/docs/developer-tools/webhooks/security/#Signatures).

## 📦 Install

    $ npm i @go1/webhook-verifier-js

## 🚀 Usage

### 📥 Verifying Incoming Webhooks

If using a NodeJS framework like ExpressJS, with the [req](https://expressjs.com/en/api.html#req) object in scope:

```js
let signature = req.header('go1-signature');

// payload can be a string OR the object already parsed by the express json middlware
let payload = req.body;

// the secret could come from some place else if you wish, but it is the secret you provided to Go1 when you created the webhook
let secret = process.env.SHARED_SECRET;
```

You can then verify the signature like so:

```js
import { verifySignature } from '@go1/webhook-verifier-js';

verifySignature(signature, payload, secret); // throws an exception if anything is invalid.
```

Or if you prefer not to have exceptions thrown you can also get a result back like so:

```js
import { isSignatureVerified } from '@go1/webhook-verifier-js';

const { isValid, error } = isSignatureVerified(signature, payload, secret);
// { isValid: true, error: undefined }

const { isValid, error } = isSignatureVerified(signature, payload, badSecret);
// { isValid: false, error: InvalidWebhookSignature('Invalid signature') }
```

There is also some optional configuration you can set before calling `verifySignature` or `isSignatureVerified`:

```js

import { configure as configureWebhookVerifier } from '@go1/webhook-verifier-js';

configureWebhookVerifier({
    timestampToleranceInSeconds: 60, // number, defaults to 60
    signatureVersion: 'v1' // string, defaults to 'v1'
});
...
```

### 🔐 Signing Webhook Requests (e.g. for internal services or testing)

If you're building a system that **sends webhooks** to other services (internal or partner), you can use the `createSignature` function to **generate the correct signature** header, in the same format Go1 expects (`t=<timestamp>,s=<digest>`).

```ts
import { createSignature } from '@go1/webhook-verifier-js';

const payload = JSON.stringify({ some: 'data' });
const secret = process.env.SHARED_SECRET;

// optional: override timestamp (defaults to now)
const timestamp = Math.floor(Date.now() / 1000);

const signatureHeader = createSignature(secret, payload, timestamp);
// Result: "t=1713270112,s=8a8c94d9..."
```

You can then use this value in your outgoing webhook request header:

```
await fetch(targetUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'go1-signature': signatureHeader,
  },
  body: payload,
});
```

> ✅ The output of `createSignature()` matches the signature format expected by `verifySignature()` and `isSignatureVerified()`, making it ideal for testing or generating internal webhooks.

## License

MIT License

## Contributing

Please open an [issue in github here](https://github.com/go1com/webhook-verifier-js/issues) and we will evaluate.
