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

***Important Note***

webpack.config.js needs to include a fallback section that sets fs and path to false, as seen here in the example: https://github.com/KhronosGroup/gltf-asset-auditor/blob/main/web-example/webpack.config.js#L40

```
fallback: {
  fs: false,
  path: false,
},
```

The reason that those values are needed is because the Asset Auditor was built to be used in both a Node.js environment as well as in a web browser and the fs (filesystem) and path modules are only available in Node.js. The frontend code doesn't call those functions, but the compiler (webpack) tries to link them anyway and setting them to false in the config allows for them to be ignored.

### Deployment

index.html and the dist/ folder are all of the required files and can be statically hosted from any server after they are built.
