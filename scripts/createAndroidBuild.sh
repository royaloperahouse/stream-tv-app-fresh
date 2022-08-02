#!bin/bash

echo "Creating build started..."
cd ../android
./gradlew assembleRelease
echo "Creating build finished"