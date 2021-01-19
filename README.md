# Express Gateway 

## Install

Make sure you have `NodeJS` and `npm` installed on your machine.
Clone the project using

```
git clone ssh://git@gitlab.paypos.tn:2208/khallasli-refonte/boilerplate-expressjs-api.git
```

and run:

```
npm install
```

## Before start the server

Go to the file `credential.service.js`in `express-gateway/lib/services/credentials`.

Now replace this methode `processCredential` with this code
```
function processCredential (credential, options = { includePassword: false }) {
  if (credential.scopes && credential.scopes.length > 0) {
    credential.scopes = JSON.parse(credential.scopes);
  }
  const credentialModel = config.models.credentials.properties[credential.type];
  return credential;
}
```

## Start the server

To start the proxy server, use

```
npm start or nodemon
```
### Detailed documentation:

[Express Gateway Overview](http://www.express-gateway.io/about/)
(https://www.express-gateway.io/getting-started/)
