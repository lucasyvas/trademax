# Converter

## Usage

A document outlining design decisions and trade-offs can be found here: [COMMENTARY](./COMMENTARY.md)

## Overview

<br>

This project implements the Converter API spec. Interacting with this project is done via [Makefile](../Makefile) with `make` for host operations, and via [package.json](../package.json) with `npm run *` for `Node.js` container development operations.

<br>

## Running

<br>

### **Method 1:** VS Code Dev Container

<br>

1. Install the recommended [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

2. Launch your Dev Container and wait for setup to complete.

<br>

Each of the following options can run the project:

<br>

#### Option 1: Terminal

<br>

```
npm run converter:dev
```

<br>

#### Option 2: VS Code

<br>

Use the `Converter: Launch` launch configuration.

<br>

### **Method 2:** Compose Testing Environment (Recommended for hypothetical CI, and possibly JetBrains)

<br>

If you'd prefer to use a fully composed developer environment from the host with remote debugging enabled, run:

<br>

```bash
make compose-dev-up
```

<br>

#### **VS Code**

<br>

If you'd like to compose and attach to the running environment in one step _from the host machine_, use the `Converter - Attach (Host)` launch configuration.

If you'd like to attach to the converter _in a an already running_ environment from **within** your Dev Container, use the `Converter - Attach (Dev Container)` launch configuration instead since it needs to contact a particular hostname.

<br>

## Production Build

<br>

In all the above cases, `ts-node` is used to quickly strip TypeScript types on the fly, so there is no compliation step required!

But, when it comes to shipping, we need to do a proper build and prepare a leaner container image. You can produce this image by running `make build`.

If you'd like to compose a "production" grade environment, you can simply run `make compose-up`, which will also perform the above step automatically.

<br>

## Testing

<br>

Provided via `jest`. You can run tests by invoking either `make test` (host) or `npm test` (container or local install) from the root project directory. This will print coverage to your terminal and also dump `lcov` coverage reports in the project directory.

<br>

#### **VS Code**

<br>

There is also a launch configuration to debug the test file in the currently active editor: `Test (Current File)`.
