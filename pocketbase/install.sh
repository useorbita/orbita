#! /bin/bash

VERSION=0.19.4

echo Downloading PocketBase v$VERSION...
wget --quiet "https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_linux_amd64.zip"

echo Extracting archive...
unzip -q "pocketbase_${VERSION}_linux_amd64.zip"

echo Removing archive...
rm "pocketbase_${VERSION}_linux_amd64.zip"

echo Done.
