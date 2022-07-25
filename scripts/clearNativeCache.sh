#!/bin/bash

echo "Clearing react-native cache is starting..."
echo "Clearing watchman is starting..."
watchman watch-del-all
cd ..
echo "Clearing watchman is finishing"
rm -rf $TMPDIR/react-native-packager-cache-*
rm -rf $TMPDIR/metro-bundler-cache-*
yarn cache clean --all
npm cache verify
echo "Metro is starting..."
adb reverse tcp:9090 tcp:9090
yarn start --reset-cache