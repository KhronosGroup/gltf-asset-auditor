#!/bin/bash

version=$1
if [ "$version" = "" ]
then
  echo "The new version number needs to be provided as an argument"
  exit 1
fi
echo "Changing the version to ${version}"

packageJson="s/\"version\": \"[a-z0-9.-]*\"/\"version\": \"${version}\"/g"
packageJsonAuditor="s/\"@khronosgroup\/gltf-asset-auditor\": \"^[a-z0-9.-]*\"/\"@khronosgroup\/gltf-asset-auditor\": \"^${version}\"/g"
sed -i '' "${packageJson}" package.json
sed -i '' "${packageJson}" cli-example/package.json
sed -i '' "${packageJsonAuditor}" cli-example/package.json
sed -i '' "${packageJson}" web-example/package.json
sed -i '' "${packageJsonAuditor}" web-example/package.json

auditor="s/version = '[a-z0-9.-]*';/version = '${version}';/g"
sed -i '' "${auditor}" src/Auditor.ts

schema="s/LoadableAttribute('Version', '[a-z0-9.-]*');/LoadableAttribute('Version', '${version}');/g"
sed -i '' "${schema}" src/Schema.ts

# package-lock.json
npm i
# Note: can't pull the new auditor package version until it's published
#cd cli-example && npm i && cd ..
#cd cli-example && npm i

# TODO: cli + web example projects
# TODO: test schemas
