#!/bin/bash

echo "Clearing iOS pods is starting..."
cd ../ios
rm Podfile.lock
rm -rf Pods
npx pod-install
echo "Clearing iOS pods is finishing"
cd ../scripts