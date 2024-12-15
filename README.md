# Trademax Monorepo

## Overview

<br>

Welcome to Trademax! Trademax is a fake organization that offers document conversion as part of its platform. This repository is currently compised of a single service: `converter`.

- [converter](converter)

_Before_ diving into the above project documentation, you should continue reading to learn how work in the repository effectively.

<br>

## Orientation

<br>

The global/host script runner is `make`, which wraps common `docker` operations into convenient commands. The lone project is written in [TypeScript](https://www.typescriptlang.org/) and `npm` is used under the hood when operating within the container.

Development tool dependencies are defined in the root [package.json](package.json) and it is expected that all development scripts will be defined here, namespaced when relevant only to a single project.

You will also notice that base configurations applicable to all projects are located in the root (for example, in [jest.config.ts](jest.config.ts), [tsconfig.json](tsconfig.json), and [package.json](package.json)). External configuration files are deliberately kept to a minimum, so if you can't find a configuration for a tool you are using, it's probably in [package.json](package.json).

<br>

## Prerequisites

<br>

You must have a \*nix-based host, as some Makefile recipes require it.

<br>

1. `Git` (Required for running) - This is probably already available on your machine, but if not, [installation instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) are available. GitHub has an excellent [setup guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) once you have the tooling installed.

2. `Docker` (Required for host development) - [installation instructions](https://docs.docker.com/engine/install/) for your development platform of choice are available. There is a [primer](https://www.docker.com/101-tutorial/) available if you need to get up to speed with your Docker knowledge.

3. `GNU Make` (Required for host development) - This should be available out of the box on most \*nix operating systems.

<br>

## Getting Started

<br>

Assuming you have the correct prerequisites installed and setup:

<br>

1. Run the following command:

   ```
   git clone git@github.com:lucasyvas/trademax.git
   ```

   <br>

2. Read instructions for working with a particular project:

   - [converter](converter/README.md)

   <br>

   **Note:** All projects and all scripts are run from the root project directory!

<br>

## Pushing changes

<br>

`husky` is used to check linting and type rules when pushing your commits to the remote repository.

<br>

## VS Code Dev Container

<br>

There is a development container you can run at any point with pre-installed extensions and tools. See each project `README.md` for instructions on how to integrate the development container into a particular project environment.

<br>

**Note:** `make` recipes are not usable in the dev container since they invoke Docker from the host. Use the `npm` equivalent scripts instead.
