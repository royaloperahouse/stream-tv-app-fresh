#!/bin/bash

echo "Clearing react-native cache is starting..."
echo "Clearing watchman is starting..."
watchman watch-del-all
cd ..
echo "Clearing watchman is finishing"
rm -rf $TMPDIR/react-native-packager-cache-*
rm -rf $TMPDIR/metro-bundler-cache-*
yarn cache clean --all
echo "Metro is starting..."
yarn start --reset-cache