#!/bin/bash
echo "Clearing android gradle is starting..."
cd ../android
rm -rf .gradle
rm -rf app/build
rm -rf ~/.gradle/caches
./gradlew clean build
#./gradlew clean
./gradlew tasks --all
cd ../scripts
echo "Clearing android gradle is finishing"