#!/bin/bash

echo "Clearing iOS pods is starting..."
cd ../ios
rm Podfile.lock
rm -rf Pods
rm -rf ./build
pod cache clean --all
rm -rf ~/.cocoapods
npx pod-install
echo "Clearing iOS pods is finishing"
cd ../scripts