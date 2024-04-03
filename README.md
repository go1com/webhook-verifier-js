# @go1/webhook-verifier-js

You can use this library to verify the signature passed in the header to your webhook target endpoint.

For more information on signatures with Go1 Webhooks [please see this guide](https://developers.go1.com/docs/developer-tools/webhooks/security/#Signatures).

## Install

    $ npm i @go1/webhook-verifier-js

## Usage

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

## License

MIT License

## Contributing

Please open an [issue in github here](https://github.com/go1com/webhook-verifier-js/issues) and we will evaluate.
