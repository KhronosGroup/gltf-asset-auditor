# Khronos glTF Asset Auditor

# Web Implementation (single page app)

## SPDX-License-Identifier: Apache-2.0

This is a sub-project of the 3DC-Validator which shows how to implement a version from a web browser stand alone page.

**_NOTE_**: package.json is still pointing to @mikefesta/3dc-validator (development package) because this package has not yet been published to npm with the @khronos namespace. This message should be updated once published.

### Usage - Compile and Test Locally

This project uses Node + webpack to build dist/main.js.

Run npm i to install dependencies (3DC-Validator and Babylon.js).

```
# Install Dependencies
npm i
```

Build the project to generate main.js in the dist/ folder.

```
# Compile the code with Webpack
npm run build
```

A simple web server can be run using python for local testing.

```
# Run a simple server on http://localhost:3000
python3 -m http.server 3000
```

Open http://localhost:3000 in a modern web browser to test it out.

### Deployment

index.html and the dist/ folder are all of the required files and can be statically hosted from any server after they are built.
