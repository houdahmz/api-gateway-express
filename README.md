# Express Gateway 

## Setup Redis Database

Begin by updating your local apt package cache:
```
sudo apt update
```
Then install Redis by typing:
```
sudo apt install redis-server
```
This will download and install Redis and its dependencies. Following this, there is one important configuration change to make in the Redis configuration file, which was generated automatically during the installation.
Open this file with your preferred text editor:
```
sudo nano /etc/redis/redis.conf
```
Inside the file, find the supervised directive. This directive allows you to declare an init system to manage Redis as a service, providing you with more control over its operation. The supervised directive is set to no by default. Since you are running Ubuntu, which uses the systemd init system, change this to systemd:
    ```
supervised systemd

    ```

That’s the only change you need to make to the Redis configuration file at this point, so save and close it when you are finished. If you used nano to edit the file, do so by pressing CTRL + X, Y, then ENTER.
Then, restart the Redis service to reflect the changes you made to the configuration file:
```
sudo systemctl restart redis.service
```

Checking that the Redis service is running:

```
sudo systemctl status redis
```
Configure then database in .env

## Installation 

1. Clone the repository with `ssh://git@gitlab.paypos.tn:2208/khallasli-refonte/boilerplate-expressjs-api.git`

​

```bash

git clone ssh://git@gitlab.paypos.tn:2208/khallasli-refonte/boilerplate-expressjs-api.git

cd boilerplate-expressjs-api

```

​

2. Install the dependencies with `npm`

​

```bash

npm install

```

​

3.  Create `.env` file from `.env.example`
    ```
    $ cp .env.example .env
    ```

    Remember to fill up required values in `.env`

4. Run the application in development mode with `npm run dev` or for quick start run `nodemon`

5. Access `http://localhost:5008` and you're ready to go!

​

## Generate a new public/private key

Use a public/private key and leverage RS256 to sign and verify your tokens.
A public key file used to verify the token signature. This can be provided from a thirty party service as well.

First of all, generate a new public/private key using openssl:
```
openssl genrsa -out private.pem 2048

```
Keep the private key in a super-secure place (under your bed might be a good place) in your system.
Then extract the public key from it:
```
openssl rsa -in private.pem -outform PEM -pubout -out public.pem

```
Now you have the public key in public.pem and the private one in private.pem.
Use the private key to sign your tokens, and give the public key to Express Gateway using the secretOrPrivateKeyFile parameter, so it can verify your tokens are correct.

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
