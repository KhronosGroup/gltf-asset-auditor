# Khronos glTF Asset Auditor

# Web Implementation (single page app)

## SPDX-License-Identifier: Apache-2.0

This is a sub-project of the glTF Asset Auditor which shows how to implement a version from a web browser stand alone page.

### Usage - Compile and Test Locally

This project uses Node + webpack to build dist/main.js.

Run npm i to install dependencies (glTF Asset Auditor and Babylon.js).

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
