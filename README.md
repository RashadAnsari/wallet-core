# Wallet Core

[![Build](https://github.com/RashadAnsari/wallet-core/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/RashadAnsari/wallet-core/actions/workflows/main.yml)

Trust Wallet Core API wrapper and more.

## API Documentation

- [Swagger Documentation](./docs/swagger.yml)

## Environment Variables

The application relies on the following environment variables for configuration:

- `PORT`: The port number on which the application will listen. If not provided, the default value is set to `3000`.

- `MNEMONIC`: The mnemonic phrase used for generating cryptographic keys or addresses. This variable is required and must be provided.

- `PASSPHRASE`: An optional passphrase or password associated with the mnemonic phrase. If not provided, the default value is set to an empty string.

Make sure to set these environment variables accordingly when running the application. You can either export them in your shell environment or provide them in a `.env` file in the root directory of your project.

## Run using Docker

To run the application using Docker, run the command below:

```bash
docker run -p 3000:3000 -e MNEMONIC="remember relief wool then dad equip team guard provide clever mom kiss" ghcr.io/rashadansari/wallet-core
```
